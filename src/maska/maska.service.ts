import { Injectable, Logger } from '@nestjs/common';
import { ForwardingInfo, MatematikaPayloadDto, Transaction } from './dto/matematika-payload.dto';
import { GeneratorsService } from 'src/generators/generators.service';
import { ContractorsService } from 'src/contractors/contractors.service';
import { TemplatesService } from 'src/templates/templates.service';

@Injectable()
export class MaskaService {
  private readonly logger = new Logger(MaskaService.name);

  constructor(
    private readonly generatorService: GeneratorsService,
    private readonly contracrorsService: ContractorsService,
    private readonly templatesService: TemplatesService,
  ) {}

  async processFinancialData(payload: MatematikaPayloadDto) {
    this.logger.log('🔄 Processing financial data...');
    this.logger.log(`Job ID: ${payload.jobId}`);
    this.logger.log(`Daily balances: ${payload.dailyBalances?.length || 0}`);
    this.logger.log(`Transactions: ${payload.transactions?.length || 0}`);

    // Здесь будет основная логика обработки данных
    // Например: сохранение в базу, отправка дальше, и т.д.

    this.logger.log('✅ Financial data processed successfully');
  }

  async processTransactions(input: MatematikaPayloadDto): Promise<any> {
    // Шаг 1: Валидация входных данных
    this.validateInput(input);

    // Шаг 2: Подготовка контекста
    // const context = this.prepareContext(input.forwardingInfo);

    // Шаг 3: Сортировка транзакций по дате (с учетом FixAsFirst)
    const sortedTransactions = this.sortTransactions(input.transactions);

    // Шаг 4: Группировка транзакций по категориям для оптимизации
    const groupedByCategory = this.groupByCategory(sortedTransactions);

    // Шаг 5: Обработка каждой транзакции
    // const processedTransactions = await Promise.all(
    //   sortedTransactions.map((tx) => this.processSingleTransaction(tx, context))
    // );

    // Шаг 6: Формирование выходного JSON
    return {
      // transactions: processedTransactions
    }

  }

  // Шаг 7.1.3: Обработка одной транзакции
  // private async processSingleTransaction(tx: Transaction, context: ProcessingContext): Promise<OutputTransaction> {
  //   // Определить категорию и метод
  //   const { category, method } = tx;

  //   // Получить имя контрагента (с учетом custom)
  //   const contractorName = await this.getContractorName(tx, context);

  //   // Сгенерировать description через TemplatesService
  //   const description = await this.templatesService.resolveTemplate(
  //     tx, context.forwardingInfo,
  //     contractorName,
  //   );

  //   // Вернуть объект с description
  //   return {
  //     transactionDate: tx.transactionDate,
  //     postingDate: tx.postingDate,
  //     description,
  //     amount: tx.amount,
  //     balanceAfter: tx.balanceAfter,
  //   };
  // }

  // 7.1.4 Определение имени контрагента
  // private async getContractorName(tx: Transaction, context: ProcessingContext): Promise<string> {
  //   // Если у транзакции есть contractorIndex:
  //   // - Получить список дефолтных для категории
  //   // - Применить замену на custom, если есть
  //   // - Вернуть контрагент по индексу
    
  //   // Для специальных случаев (Zelle, ATM) - своя логика
  //   return '';
  // };

  // 7.1.5 Обработка calculation details
  private formatCalculation(tx: Transaction): string {
    // Если tx.calculationDetails существует:
    // - Формат: "{quantity} {unit} @ ${rate}"
    // - Пример: "36 HR @ $4.10"
    // - Вставить в шаблон вместо {CALCULATION}
    return '';
  }

  private validateInput(input: MatematikaPayloadDto): void {
    // Проверить, что companyInfo.companyName существует
    // Проверить, что customContractors не превышает лимит
    // Проверить, что для каждой категории в customContractors 
    // количество не больше дефолтных контрагентов
    // Проверить длины строк (companyName <= 40 символов)
    // Проверить формат дат
  };

  // private prepareContext(forwardingInfo: ForwardingInfo): ProcessingContext {
  //   return {
  //     forwardingInfo,
  //   };
  // };

  private sortTransactions(transactions: Transaction[]): Transaction[] {
    return transactions;
  };

  private groupByCategory(transactions: Transaction[]): Transaction[] {
    return transactions;
  };

  // private resolveContractorName(tx: Transaction, context: ProcessingContext): string {
  //   return '';
  // };

  // Очистка кэшей после обработки (важно!)
  private cleanup(): void {
    // Очистить кэши
  };

}
