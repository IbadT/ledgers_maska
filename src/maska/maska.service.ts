import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { MatematikaPayloadDto, ForwardingInfoInputDto, TransactionInputDto } from './dto/matematika-payload.dto';
import { GeneratorsService } from '../generators/generators.service';
import { ContractorsService } from '../contractors/contractors.service';
import { TemplatesService } from '../templates/templates.service';
import {
  ExpensesBreakdownDto,
  MaskaResponseDto,
  MaskedTransactionDto,
  RevenueBreakdownDto,
  TotalDto,
  TransactionCountDto,
  DepositsDto,
  WithdrawalsDto,
} from './dto/matematika-response.dto';
import { PaymentMethod } from '../shared/enums/transaction-category.enum';
import { CATEGORY_MAP, CategoryMapping } from '../config/category-mapper';
import { ForwardingInfo, MaskedTransaction, ProcessingContext, TransactionInput } from './interfaces/maska.types';
import { outputMaskaResponse, outputTransformForwardingInfo } from './mapper/outputResponse';
import { TemplateData } from './interfaces/template-data.interface';

@Injectable()
export class MaskaService {
  private readonly logger = new Logger(MaskaService.name);

  constructor(
    private readonly generatorService: GeneratorsService,
    private readonly contractorsService: ContractorsService,
    private readonly templatesService: TemplatesService,
  ) {}

  async processFinancialData(payload: MatematikaPayloadDto): Promise<MaskaResponseDto> {
    this.logger.log('🔄 Processing financial data...');
    this.logger.log(`Job ID: ${payload.jobId}`);
    this.logger.log(`Transactions: ${payload.transactions?.length || 0}`);

    const result = await this.processTransactions(payload);

    this.logger.log('✅ Financial data processed successfully');
    return result;
  }

  async processTransactions(input: MatematikaPayloadDto): Promise<MaskaResponseDto> {
    // Шаг 1: Валидация
    this.validateInput(input);

    // Шаг 2: Трансформация и подготовка контекста
    const transformedInput = this.transformInput(input);
    const context = this.prepareContext(transformedInput.forwardingInfo);

    // Шаг 3: Сортировка
    const sortedTransactions = this.sortTransactions(transformedInput.transactions);

    // Шаг 4: Обработка каждой транзакции
    const maskedTransactions = await Promise.all(
      sortedTransactions.map((tx) => this.processSingleTransaction(tx, context)),
    );

    // Шаг 5: Расчет статистики
    const financialSummary = this.calculateFinancialSummary(maskedTransactions, transformedInput, input);

    // Шаг 6: Очистка
    this.cleanup(context);

    // Шаг 7: Формирование ответа
    return outputMaskaResponse({
      financialSummary,
      transactions: maskedTransactions.map(this.toResponseDto),
      balances: input.dailyBalances,
    });
  }

  // ==========================================
  // ШАГ 2: Трансформация
  // ==========================================

  // TODO: mapper
  private transformInput(input: MatematikaPayloadDto): {
    forwardingInfo: ForwardingInfo;
    transactions: TransactionInput[];
  } {
    return {
      forwardingInfo: this.transformForwardingInfo(input.forwardingInfo),
      transactions: input.transactions.map((tx, index) => this.transformTransaction(tx, index)),
    };
  }

  private transformForwardingInfo(info: ForwardingInfoInputDto): ForwardingInfo {
    // Трансформация customContractors из массива в Record
    const customContractors: Record<string, string[]> = {};
    if (Array.isArray(info.customContractors)) {
      // Если пустой массив — оставляем пустой объект
    } else if (typeof info.customContractors === 'object') {
      Object.assign(customContractors, info.customContractors);
    }

    // Трансформация customCustomers из массива объектов в массив строк
    const customCustomers: string[] = [];
    if (Array.isArray(info.customCustomers)) {
      for (const item of info.customCustomers) {
        if (typeof item === 'string') {
          customCustomers.push(item);
        } else if (item && typeof item === 'object' && item.name) {
          customCustomers.push(item.name);
        }
      }
    }

    return outputTransformForwardingInfo({
      info,
      customContractors,
      customCustomers,
    });

    // return {
    //   companyInfo: {
    //     companyName: info.companyName,
    //     ownerName: info.ownerName,
    //     state: info.state || 'CA',  // ⚠️ Дефолт, но должно приходить!
    //     accountNumber: info.accountNumber || info.associatedCard?.slice(-4) || '2910',
    //   },
    //   cards: [info.associatedCard?.slice(-4) || '2910'],
    //   customContractors,
    //   customCustomers,
    //   persistentContractors: info.persistentContractors || {},
    // };
  }

  // TODO: mapper
  private transformTransaction(tx: TransactionInputDto, index: number): TransactionInput {
    return {
      transactionId: tx.transactionId,
      transactionDate: tx.transactionDate,
      postingDate: tx.postingDate.split('T')[0], // Обрезаем время!
      amount: tx.amount,
      balanceAfter: tx.balanceAfter,
      category: tx.category,
      method: tx.method,
      isManual: tx.isManual,
      type: tx.type,
      FixAsFirst: tx.FixAsFirst,
      contractorIndex: tx.contractorIndex ?? index % 3, // Распределяем по 3 контрагента
      calculationDetails: tx.calculationDetails,
      associatedCard: tx.associatedCard,
    };
  }

  private prepareContext(forwardingInfo: ForwardingInfo): ProcessingContext {
    return {
      companyInfo: forwardingInfo.companyInfo,
      forwardingInfo,
      generators: this.generatorService.createContext(),
      contractorCache: new Map(),
      coIdCache: new Map(),
      randomCache: new Map(),
    };
  }

  // ==========================================
  // ШАГ 3: Сортировка
  // ==========================================

  private sortTransactions(transactions: TransactionInput[]): TransactionInput[] {
    return [...transactions].sort((a, b) => {
      if (a.FixAsFirst && !b.FixAsFirst) return -1;
      if (!a.FixAsFirst && b.FixAsFirst) return 1;
      return new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime();
    });
  }

  // ==========================================
  // ШАГ 4: Обработка одной транзакции
  // ==========================================

  private async processSingleTransaction(tx: TransactionInput, ctx: ProcessingContext): Promise<MaskedTransaction> {
    // 4.1: Маппинг категории
    const mapping = CATEGORY_MAP[tx.category];
    if (!mapping) {
      this.logger.warn(`Unknown category: ${tx.category}, using fallback`);
    }

    // 4.2: Определить метод (с исправлением для доходов)
    const method = this.resolveMethod(tx.method, tx.type, mapping);

    // 4.3: Получить шаблон
    const template = this.templatesService.getTemplate(mapping?.technicalCategory || 'generic', method);

    // 4.4: Подготовить данные
    const data = await this.prepareTemplateData(tx, mapping, ctx);

    // 4.5: Рендер
    const description = this.templatesService.render(template, data);

    // 4.6: Результат
    return {
      transactionDate: tx.transactionDate,
      postingDate: tx.postingDate,
      description,
      amount: tx.amount,
      balanceAfter: tx.balanceAfter,
      _originalCategory: tx.category,
      _templateType: template.type,
      _transactionId: tx.transactionId,
    };
  }

  // ==========================================
  // src/maska/maska.service.ts (исправленный resolveMethod)
  // ==========================================

  private resolveMethod(method: string, type: string, mapping?: CategoryMapping): PaymentMethod {
    // Приоритет: маппинг из CATEGORY_MAP
    if (mapping?.methodOverride) {
      return mapping.methodOverride as PaymentMethod;
    }

    // ⚠️ КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: нормализуем ACH_DEBIT → ACH для всех
    if (method === PaymentMethod.ACH_DEBIT) {
      return PaymentMethod.ACH;
    }

    // Для доходов с ACH_DEBIT → GATEWAY (только если нет override)
    if (method === PaymentMethod.ACH_DEBIT && type === 'income') {
      return PaymentMethod.GATEWAY;
    }

    return method as PaymentMethod;
  }

  // ==========================================
  // src/maska/maska.service.ts (ключевые исправления)
  // ==========================================

  // В prepareTemplateData — передаём companyInfo правильно:

  private async prepareTemplateData(
    tx: TransactionInput,
    mapping: CategoryMapping | undefined,
    ctx: ProcessingContext,
    // ): Promise<Record<string, any>> {
  ): Promise<TemplateData> {
    // ⚠️ ГЕНЕРИРУЕМ ID ПЕРВЫМ ДЕЛОМ!
    const pmtId = this.generatorService.generatePmtId(ctx.generators);
    const coId = this.generatorService.generateCoId(ctx.companyInfo.companyName, ctx.generators);
    const confirm = this.generatorService.generateConfirmNumber(ctx.generators);

    this.logger.debug(`Generated IDs: PMT=${pmtId}, CO=${coId}, CONFIRM=${confirm}`);

    // const data: Record<string, any> = {
    const data: TemplateData = {
      companyInfo: {
        companyName: ctx.companyInfo.companyName,
        ownerName: ctx.companyInfo.ownerName,
        state: ctx.companyInfo.state,
        accountNumber: ctx.companyInfo.accountNumber,
      },
      date: tx.postingDate,
      cardLast4: tx.associatedCard || ctx.forwardingInfo.cards[0] || '2910',

      // ⚠️ ВАЖНО: передаём сгенерированные ID в data
      pmtId, // ← для шаблона {PMT_ID}
      coId, // ← для шаблона {CO_ID}
      confirm, // ← для шаблона {CONFIRM}
    };

    // Контрагенты и специфичные данные
    if (mapping?.requiresContractor) {
      data.contractor = await this.getContractorName(tx, mapping, ctx);
    }

    // Gateway — выбираем из CSV
    if (mapping?.technicalCategory === 'gateway_deposit') {
      const cacheKey = 'gateway_random';
      if (!ctx.randomCache.has(cacheKey)) {
        const gateway = this.contractorsService.getRandomFromCsv('gateways');
        ctx.randomCache.set(cacheKey, gateway);
        this.logger.debug(`Selected gateway: ${gateway}`);
      }
      data.gateway = ctx.randomCache.get(cacheKey);
    }

    // Fuel/Card - получаем данные мерчанта
    if (mapping?.technicalCategory === 'card_fuel') {
      const cacheKey = 'merchant_data';
      if (!ctx.randomCache.has(cacheKey)) {
        const merchantData = this.contractorsService.getMerchantData('card_fuel', ctx.companyInfo.state);
        if (merchantData) {
          data.merchantName = merchantData.name;
          data.stateCode = merchantData.state;
          this.logger.debug(`Selected merchant: ${merchantData.name}, ${merchantData.state}`);
        } else {
          data.merchantName = 'UNKNOWN';
          data.stateCode = ctx.companyInfo.state || 'CA';
        }
        ctx.randomCache.set(cacheKey, { merchantName: data.merchantName, stateCode: data.stateCode });
      } else {
        const cached = ctx.randomCache.get(cacheKey);
        if (cached) {
          data.merchantName = cached.merchantName;
          data.stateCode = cached.stateCode;
        }
      }
    }

    // ATM Deposit - получаем город и генерируем ATM ID
    if (mapping?.technicalCategory === 'atm_deposit') {
      const cacheKey = 'atm_data';
      if (!ctx.randomCache.has(cacheKey)) {
        const city = this.contractorsService.getRandomFromCsv('atm_cities');
        const atmId = this.generatorService.generateAtmId();
        ctx.randomCache.set(cacheKey, { city, atmId });
        this.logger.debug(`Selected ATM city: ${city}, ATM ID: ${atmId}`);
      }
      const cached = ctx.randomCache.get(cacheKey);
      if (cached) {
        data.merchantName = cached.city; // Используем merchantName для города
        data.stateCode = ctx.companyInfo.state || 'CA';
        // Добавим ATM ID в данные для шаблона
        (data as any).atmId = cached.atmId;
      }
    }

    // Payroll
    if (mapping?.technicalCategory === 'payroll') {
      if (!data.contractor) {
        // Дефолт если не выбран
        data.contractor = 'ADP';
      }
      data.paydate = this.formatPaydate(data.date);
    }

    // Mobile Payment
    if (mapping?.technicalCategory === 'mobile_payment') {
      const cacheKey = 'mobile_operator';
      if (!ctx.randomCache.has(cacheKey)) {
        const mobileOperator = this.contractorsService.getRandomFromCsv('mobile_operators');
        const phoneNumber = this.generatorService.generatePhoneNumber();
        ctx.randomCache.set(cacheKey, { operator: mobileOperator, phone: phoneNumber });
        this.logger.debug(`Selected mobile operator: ${mobileOperator}, phone: ${phoneNumber}`);
      }
      const cached = ctx.randomCache.get(cacheKey);
      if (cached) {
        data.merchantName = cached.operator;
        (data as any).phoneNumber = cached.phone;
      }
      data.stateCode = ctx.companyInfo.state || 'CA';
    }

    // Utility Payment
    if (mapping?.technicalCategory === 'utility_payment') {
      const cacheKey = 'utility_provider';
      if (!ctx.randomCache.has(cacheKey)) {
        const utilityProvider = this.contractorsService.getRandomFromCsv('utilities');
        ctx.randomCache.set(cacheKey, utilityProvider);
        this.logger.debug(`Selected utility provider: ${utilityProvider}`);
      }
      data.merchantName = ctx.randomCache.get(cacheKey);
      data.stateCode = ctx.companyInfo.state || 'CA';
    }

    // Insurance Payment
    if (mapping?.technicalCategory === 'insurance_payment') {
      const cacheKey = 'insurance_provider';
      if (!ctx.randomCache.has(cacheKey)) {
        const insuranceProvider = this.contractorsService.getRandomFromCsv('insurance');
        ctx.randomCache.set(cacheKey, insuranceProvider);
        this.logger.debug(`Selected insurance provider: ${insuranceProvider}`);
      }
      data.merchantName = ctx.randomCache.get(cacheKey);
    }

    // Marketing Payment
    if (mapping?.technicalCategory === 'marketing_payment') {
      const cacheKey = 'marketing_provider';
      if (!ctx.randomCache.has(cacheKey)) {
        const marketingProvider = this.contractorsService.getRandomFromCsv('marketing');
        ctx.randomCache.set(cacheKey, marketingProvider);
        this.logger.debug(`Selected marketing provider: ${marketingProvider}`);
      }
      data.merchantName = ctx.randomCache.get(cacheKey);
    }

    this.logger.debug(
      `Template data prepared: ${JSON.stringify({
        ...data,
        companyInfo: '...', // сокращаем для лога
      })}`,
    );

    return data;
  }

  private async getContractorName(
    tx: TransactionInput,
    mapping: CategoryMapping,
    ctx: ProcessingContext,
  ): Promise<string> {
    const category = mapping.technicalCategory;
    const state = ctx.companyInfo.state;
    const cacheKey = `${category}_${state}`;

    // Загрузка из CSV (с кэшированием)
    if (!ctx.contractorCache.has(cacheKey)) {
      const contractors = await this.contractorsService.loadContractors(category, state);
      ctx.contractorCache.set(cacheKey, contractors);
    }

    const defaults = ctx.contractorCache.get(cacheKey)!;

    // Применение custom контрагентов
    const customs = ctx.forwardingInfo.customContractors[category] || [];
    const merged = this.contractorsService.mergeWithCustom(defaults, customs, category);

    // Проверка лимита (не больше custom чем defaults)
    if (customs.length > defaults.length) {
      this.logger.error(`Too many custom contractors for ${category}: ${customs.length} > ${defaults.length}`);
      throw new BadRequestException(`Custom contractors exceed limit for ${category}`);
    }

    // Выбор по индексу с проверкой
    const index = (tx.contractorIndex || 0) % merged.merged.length;
    return merged.merged[index];
  }

  // private async enrichCategoryData(
  //   data: Record<string, any>,
  //   mapping: CategoryMapping | undefined,
  //   ctx: ProcessingContext,
  // ): Promise<void> {
  //   if (!mapping) return;

  //   const cacheKey = `random_${mapping.technicalCategory}`;

  //   switch (mapping.technicalCategory) {
  //     case 'gateway_deposit':
  //       // Консистентный выбор gateway для одной транзакции
  //       if (!ctx.randomCache.has(cacheKey)) {
  //         ctx.randomCache.set(cacheKey, this.contractorsService.getRandomFromCsv('gateways'));
  //       }
  //       data.gateway = ctx.randomCache.get(cacheKey);
  //       break;

  //     case 'payroll':
  //       data.paydate = this.formatPaydate(data.date);
  //       // Payroll provider из CSV или дефолт
  //       if (!data.contractor) {
  //         data.contractor = 'ADP'; // Дефолт
  //       }
  //       break;

  //     case 'card_fuel':
  //       data.merchantCode = this.getMerchantCode('fuel');
  //       data.city = this.contractorsService.getRandomFromCsv('atm_cities');
  //       break;

  //     case 'card_subscription':
  //       data.merchantCode = this.getMerchantCode('subscription');
  //       data.recurring = 'RECURRING';
  //       break;

  //     case 'atm_deposit':
  //       data.atmId = this.generatorService.generateAtmId(ctx.generators);
  //       data.city = this.contractorsService.getRandomFromCsv('atm_cities');
  //       break;

  //     case 'chassis_rental':
  //       // calculation уже в data
  //       break;
  //   }
  // }

  // ==========================================
  // Вспомогательные методы
  // ==========================================

  // TODO: анализ
  // private formatCalculation(details: { quantity: number; rate: number; unit: string }): string {
  //   return `${details.quantity} ${details.unit} @ $${details.rate.toFixed(2)}`;
  // }

  private formatPaydate(dateStr: string): string {
    const date = new Date(dateStr);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${mm}${dd}`; // MMDD
  }

  // private getMerchantCode(category: 'fuel' | 'subscription'): string {
  //   const codes = {
  //     fuel: ['5541', '5542', '5983'],
  //     subscription: ['4899', '5734', '7372'],
  //   };
  //   const list = codes[category];
  //   return list[Math.floor(Math.random() * list.length)];
  // }

  // TODO: mapper
  private toResponseDto(tx: MaskedTransaction): MaskedTransactionDto {
    return {
      transactionDate: tx.transactionDate,
      postingDate: tx.postingDate,
      description: tx.description,
      amount: tx.amount,
      balanceAfter: tx.balanceAfter,
    };
  }

  // ==========================================
  // ШАГ 5: Расчет статистики
  // ==========================================

  private calculateFinancialSummary(
    transactions: MaskedTransaction[],
    transformedInput: { forwardingInfo: ForwardingInfo },
    originalInput: MatematikaPayloadDto,
  ): MaskaResponseDto['financialSummary'] {
    return {
      companyName: transformedInput.forwardingInfo.companyInfo.companyName,
      accountNumber: transformedInput.forwardingInfo.companyInfo.accountNumber || '2910',
      period: `${originalInput.dailyBalances[0]?.date} - ${originalInput.dailyBalances[originalInput.dailyBalances.length - 1]?.date}`,
      initialBalance: originalInput.summary.initialBalance,
      finalBalance: transactions[transactions.length - 1]?.balanceAfter || originalInput.summary.finalBalance,
      totals: this.calculateTotals(transactions),
      revenueBreakdown: this.calculateRevenueBreakdown(transactions),
      expensesBreakdown: this.calculateExpensesBreakdown(transactions),
      transactionCount: this.calculateTransactionCounts(transactions),
    };
  }

  private calculateTotals(transactions: MaskedTransaction[]): TotalDto {
    return transactions.reduce(
      (acc, cur) => {
        if (cur.amount > 0) {
          acc.totalRevenue += cur.amount;
        } else {
          acc.totalExpenses += Math.abs(cur.amount);
        }
        acc.netProfit += cur.amount;
        return acc;
      },
      { totalRevenue: 0, totalExpenses: 0, netProfit: 0 },
    );
  }

  private calculateRevenueBreakdown(transactions: MaskedTransaction[]): RevenueBreakdownDto {
    const breakdown = { totalAch: 0, totalWire: 0, totalZelle: 0, totalGateway: 0, totalOther: 0 };

    for (const tx of transactions) {
      if (tx.amount <= 0) continue;

      const desc = tx.description.toUpperCase();
      if (desc.includes('DES:ACH') || desc.includes('ACH PMT')) {
        breakdown.totalAch += tx.amount;
      } else if (desc.includes('WIRE')) {
        breakdown.totalWire += tx.amount;
      } else if (desc.includes('ZELLE')) {
        breakdown.totalZelle += tx.amount;
      } else if (desc.includes('DES:DEPOSIT') || desc.includes('STRIPE') || desc.includes('SQUARE')) {
        breakdown.totalGateway += tx.amount;
      } else {
        breakdown.totalOther += tx.amount;
      }
    }

    return breakdown;
  }

  private calculateExpensesBreakdown(transactions: MaskedTransaction[]): ExpensesBreakdownDto {
    let byCard = 0;
    let byAccount = 0;

    for (const tx of transactions) {
      if (tx.amount >= 0) continue;

      const desc = tx.description.toUpperCase();
      const abs = Math.abs(tx.amount);

      if (desc.includes('CHECKCARD') || desc.includes('PURCHASE')) {
        byCard += abs;
      } else {
        byAccount += abs;
      }
    }

    return { byCard, byAccount };
  }

  private calculateTransactionCounts(transactions: MaskedTransaction[]): TransactionCountDto {
    const deposits: DepositsDto = { total: 0, ach: 0, wire: 0, zelle: 0 };
    const withdrawals: WithdrawalsDto = { total: 0, fromAccount: 0, byCard: 0 };

    for (const tx of transactions) {
      const desc = tx.description.toUpperCase();

      if (tx.amount > 0) {
        deposits.total++;
        if (desc.includes('ACH')) deposits.ach++;
        else if (desc.includes('WIRE')) deposits.wire++;
        else if (desc.includes('ZELLE')) deposits.zelle++;
      } else {
        withdrawals.total++;
        if (desc.includes('CHECKCARD') || desc.includes('PURCHASE')) {
          withdrawals.byCard++;
        } else {
          withdrawals.fromAccount++;
        }
      }
    }

    return {
      total: transactions.length,
      deposits,
      withdrawals,
    };
  }

  // ==========================================
  // ШАГ 1 & 6: Валидация и очистка
  // ==========================================

  private validateInput(input: MatematikaPayloadDto): void {
    if (!input.forwardingInfo?.companyName) {
      throw new BadRequestException('companyName is required');
    }

    if (input.forwardingInfo.companyName.length > 40) {
      throw new BadRequestException('companyName exceeds 40 characters');
    }

    if (!input.transactions?.length) {
      throw new BadRequestException('transactions array is empty');
    }

    // TODO: mapper
    // Проверка консистентности балансов
    for (let i = 1; i < input.transactions.length; i++) {
      const prev = input.transactions[i - 1];
      const curr = input.transactions[i];
      const expected = prev.balanceAfter + curr.amount;

      if (Math.abs(expected - curr.balanceAfter) > 0.01) {
        this.logger.warn(
          `Balance mismatch at ${i}: expected ${expected.toFixed(2)}, got ${curr.balanceAfter.toFixed(2)}`,
        );
      }
    }

    // Предупреждение если нет state
    if (!input.forwardingInfo.state) {
      this.logger.warn('No state provided in forwardingInfo, using default CA');
    }
  }

  private cleanup(ctx: ProcessingContext): void {
    ctx.contractorCache.clear();
    ctx.coIdCache.clear();
    ctx.randomCache.clear();
    this.generatorService.cleanup(ctx.generators);
  }
}
