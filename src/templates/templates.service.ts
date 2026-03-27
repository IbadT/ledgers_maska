// ==========================================
// src/templates/templates.service.ts (ПОЛНОСТЬЮ ИСПРАВЛЕННЫЙ)
// ==========================================

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PaymentMethod } from '../shared/enums/transaction-category.enum';
import { PlaceholderSource, PlaceholderFormatter, Template, PlaceholderConfig, MaskPattern } from './interfaces/template.interface';
import { TemplateData } from 'src/maska/interfaces/template-data.interface';
import { MaskPatternParserService } from './mask-pattern-parser.service';
import { CaseFormatterService } from './case-formatter.service';
import { SequentialGeneratorService } from '../generators/sequential-generator.service';

@Injectable()
export class TemplatesService implements OnModuleInit {
  private readonly logger = new Logger(TemplatesService.name);
  private templates: Map<string, Template> = new Map();

  // Пути к файлам (жёстко прописаны для надёжности)
  private readonly BASE_DIR = process.cwd();
  private readonly TEMPLATES_DIR = path.join(this.BASE_DIR, 'src', 'assets', 'templates');
  private readonly CSV_DIR = path.join(this.BASE_DIR, 'src', 'assets', 'csv');

  constructor(
    private readonly maskPatternParser: MaskPatternParserService,
    private readonly caseFormatter: CaseFormatterService,
    private readonly sequentialGenerator: SequentialGeneratorService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('🔄 Loading templates...');
    this.logger.log(`📁 Templates dir: ${this.TEMPLATES_DIR}`);
    this.logger.log(`📁 CSV dir: ${this.CSV_DIR}`);

    // Проверяем существование директорий
    if (!fs.existsSync(this.TEMPLATES_DIR)) {
      this.logger.error(`❌ Templates directory not found: ${this.TEMPLATES_DIR}`);
      this.loadDefaultTemplates();
      return;
    }

    // Список файлов для загрузки (имена как в файловой системе!)
    const templateFiles = [
      'gateway-deposit.json',
      'payroll.json',
      'payroll-new-syntax.json',
      'payroll-case-examples.json',
      'ach-incoming.json',
      'wire-incoming.json',
      'zelle.json',
      'atm-deposit.json',
      'atm-deposit-new-syntax.json',
      'card-fuel.json',
      'card-fuel-new-syntax.json',
      'gasstation-checkcard.json',
      'card-subscription.json',
      'card-parts.json',
      'chassis-rental.json',
      'owner-transfer.json',
      'internal-transfer.json',
      'irs-payment.json',
      'mobile-payment.json',
      'utility-payment.json',
      'insurance-payment.json',
      'marketing-payment.json',
    ];

    let loaded = 0;
    let failed = 0;

    for (const fileName of templateFiles) {
      const filePath = path.join(this.TEMPLATES_DIR, fileName);

      try {
        if (!fs.existsSync(filePath)) {
          this.logger.warn(`⏭️  Not found: ${filePath}`);
          failed++;
          continue;
        }

        const content = fs.readFileSync(filePath, 'utf-8');
        const template: Template = JSON.parse(content);

        // Ключ: category_method или category_method_new для новых шаблонов
        const isNewSyntax = fileName.includes('-new');
        const key = isNewSyntax 
          ? `${template.category}_${template.method}_new`
          : `${template.category}_${template.method}`;
        this.templates.set(key, template);

        this.logger.log(`✅ Loaded: ${fileName} → key: "${key}"`);
        loaded++;
      } catch (error) {
        this.logger.error(`❌ Failed ${fileName}: ${error instanceof Error ? error.message : String(error)}`);
        failed++;
      }
    }

    this.logger.log(`📊 Templates: ${loaded} loaded, ${failed} failed`);

    if (this.templates.size === 0) {
      this.logger.warn('⚠️  No templates loaded! Using defaults...');
      this.loadDefaultTemplates();
    }

    // Логируем все загруженные ключи
    this.logger.log('🔑 Available template keys:');
    for (const key of this.templates.keys()) {
      this.logger.log(`   "${key}"`);
    }
  }

  getTemplate(category: string, method: PaymentMethod): Template {
    return this.getTemplateWithPreference(category, method);
  }

  /**
   * Выбирает шаблон с приоритетом нового синтаксиса
   * 1. Сначала ищет шаблон с новым &синтаксисом (суффикс _new)
   * 2. Затем ищет обычный шаблон 
   * 3. Возвращает generic если ничего не найдено
   */
  getTemplateWithPreference(category: string, method: PaymentMethod): Template {
    const newKey = `${category}_${method}_new`;
    const newTemplate = this.templates.get(newKey);
    
    if (newTemplate) {
      this.logger.debug(`✅ Using NEW syntax template: "${newKey}"`);
      return newTemplate;
    }
    
    const oldKey = `${category}_${method}`;
    const oldTemplate = this.templates.get(oldKey);
    
    if (oldTemplate) {
      this.logger.debug(`🔄 Using LEGACY syntax template: "${oldKey}"`);
      return oldTemplate;
    }
    
    this.logger.error(`❌ Template NOT FOUND: "${oldKey}" (tried new: "${newKey}")`);
    this.logger.error(`   Available: ${Array.from(this.templates.keys()).join(', ')}`);
    return this.getGenericTemplate();
  }

  // render(template: Template, data: Record<string, any>): string {
  render(template: Template, data: TemplateData): string {
    this.logger.debug(`🎨 Rendering template: ${template.type}`);
    this.logger.debug(`   Data keys: ${Object.keys(data).join(', ')}`);

    // Проверяем, содержит ли шаблон &синтаксис
    if (this.maskPatternParser.hasMaskSyntax(template.templateString)) {
      return this.renderWithMaskSyntax(template.templateString, data);
    }

    // Используем старую логику для обратной совместимости
    return this.renderWithLegacySyntax(template, data);
  }

  /**
   * Рендеринг с новым &синтаксисом
   */
  private renderWithMaskSyntax(templateString: string, data: TemplateData): string {
    this.logger.debug(`🔥 Using new &syntax rendering`);
    
    const parsed = this.maskPatternParser.parseTemplate(templateString);
    let result = '';

    // Собираем результат из статических частей и паттернов
    for (let i = 0; i < parsed.staticParts.length; i++) {
      result += parsed.staticParts[i];
      
      if (i < parsed.patterns.length) {
        const pattern = parsed.patterns[i];
        const value = this.resolveMaskPattern(pattern, data);
        result += value;
      }
    }

    this.logger.debug(`   Result: "${result}"`);
    return result;
  }

  /**
   * Разрешает значение для паттерна &синтаксиса
   */
  private resolveMaskPattern(pattern: MaskPattern, data: TemplateData): string {
    let rawValue = '';

    this.logger.debug(`Resolving pattern: type=${pattern.type}, name=${pattern.name}, rules="${pattern.rules}"`);

    switch (pattern.type) {
      case 'sequential':
        this.logger.debug(`Calling sequential generator with pattern: "${pattern.rules}"`);
        rawValue = this.sequentialGenerator.generateSequential(
          pattern.rules || '1',
          `${pattern.name.toLowerCase()}_counter`
        );
        this.logger.debug(`Sequential generator returned: "${rawValue}"`);
        break;

      case 'company_name':
        rawValue = data.companyInfo.companyName;
        break;

      case 'date':
        rawValue = this.caseFormatter.formatDate(data.date, pattern.rules || 'MMDD');
        break;

      case 'merchant':
        rawValue = data.merchantName || data.contractor || 'UNKNOWN';
        break;

      case 'state_code':
        rawValue = data.stateCode || data.companyInfo.state || 'CA';
        break;

      case 'card_last4':
        rawValue = data.cardLast4 || '0000';
        break;

      case 'phone_number':
        rawValue = (data as any).phoneNumber || '000-000-0000';
        break;

      case 'atm_id':
        rawValue = (data as any).atmId || '00000000';
        break;

      default:
        rawValue = 'UNKNOWN';
        break;
    }

    // Применяем регистрозависимое форматирование
    const caseFormat = this.caseFormatter.determineCaseFormat(pattern.originalCase);
    return this.caseFormatter.formatCase(rawValue, caseFormat, pattern.originalCase);
  }

  /**
   * Рендеринг с устаревшим {синтаксисом} для обратной совместимости
   */
  private renderWithLegacySyntax(template: Template, data: TemplateData): string {
    this.logger.debug(`🔄 Using legacy {} syntax rendering`);
    
    let result = template.templateString || '';

    // Проверяем, что placeholders существует и является массивом
    if (template.placeholders && Array.isArray(template.placeholders)) {
      for (const ph of template.placeholders) {
        const rawValue = this.resolvePlaceholder(ph, data);
        const formatted = this.applyFormatter(rawValue, ph.formatter);

        this.logger.debug(`   {${ph.name}}: "${rawValue}" → "${formatted}"`);

        result = result.replace(new RegExp(`\\{${ph.name}\\}`, 'g'), formatted);
      }
    } else {
      this.logger.warn(`Template ${template.type} has no placeholders array, using static content`);
    }

    // Применяем toUpperCase только если result не пустой
    if (result) {
      result = result.toUpperCase();
    }

    if (template.maxLength && result.length > template.maxLength) {
      result = result.substring(0, template.maxLength);
    }

    this.logger.debug(`   Result: "${result}"`);
    return result;
  }

  // ==========================================
  // src/templates/templates.service.ts (исправленный resolvePlaceholder)
  // ==========================================

  // TODO: несоответствие полей
  private resolvePlaceholder(ph: PlaceholderConfig, data: Record<string, any>): string {
    // private resolvePlaceholder(ph: PlaceholderConfig, data: TemplateData): string {
    // Нормализуем имя: PMT_ID → pmtId (camelCase)
    const camelCaseName = ph.name.toLowerCase().replace(/_([a-z])/g, (g: string) => g[1].toUpperCase());

    switch (ph.source) {
      case PlaceholderSource.GENERATED:
        // Ищем по camelCase имени: pmtId, coId, confirm
        const genValue = data[camelCaseName];
        if (!genValue) {
          this.logger.warn(
            `   ⚠️  Generated value missing for {${ph.name}}, camelCase: ${camelCaseName}, available: ${Object.keys(data).join(', ')}`,
          );
          return '0'.repeat(ph.length || 10);
        }
        return String(genValue);

      case PlaceholderSource.COMPANY_INFO:
        const companyValue = data.companyInfo?.[ph.field!] || data[ph.field!] || '';
        return String(companyValue);

      case PlaceholderSource.CONTRACTOR:
        // Для payroll: contractor, но в шаблоне может быть {PROVIDER}
        return data.contractor || data[ph.name.toLowerCase()] || 'UNKNOWN';

      case PlaceholderSource.RANDOM:
        // gateway, atmCity и т.д.
        return data[ph.name.toLowerCase()] || ph.options?.[0] || 'UNKNOWN';

      case PlaceholderSource.DATE:
        return this.formatDate(data.date, ph.dateFormat);

      case PlaceholderSource.CALCULATION:
        return data.calculation || '';

      case PlaceholderSource.CARD:
        return data.cardLast4 || '0000';

      case PlaceholderSource.STATIC:
        return ph.defaultValue || '';

      default:
        return data[camelCaseName] || '';
    }
  }

  private formatDate(dateStr: string, format?: string): string {
    const date = new Date(dateStr);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');

    switch (format) {
      case 'MMDD':
        return `${mm}${dd}`;
      case 'MM_DD':
        return `${mm}/${dd}`;
      default:
        return dateStr;
    }
  }

  private applyFormatter(value: string, formatter?: PlaceholderFormatter): string {
    if (!formatter) return value;

    switch (formatter) {
      case PlaceholderFormatter.UPPERCASE:
        return this.caseFormatter.formatCase(value, 'upper');
      case PlaceholderFormatter.TRUNCATE_30:
        return value.length > 30 ? value.substring(0, 30) : value;
      case PlaceholderFormatter.TRUNCATE_40:
        return value.length > 40 ? value.substring(0, 40) : value;
      case PlaceholderFormatter.LAST4:
        return value.slice(-4);
      case PlaceholderFormatter.TITLE_CASE:
        return this.caseFormatter.formatCase(value, 'title');
      case PlaceholderFormatter.LOWERCASE:
        return this.caseFormatter.formatCase(value, 'lower');
      case PlaceholderFormatter.AS_IS:
        return this.caseFormatter.formatCase(value, 'asis');
      case PlaceholderFormatter.AUTO_CASE:
        return this.caseFormatter.formatCase(value, 'auto');
      default:
        return value;
    }
  }

  private loadDefaultTemplates(): void {
    this.logger.log('📦 Loading DEFAULT templates...');

    this.templates.set('gateway_deposit_GATEWAY', {
      type: 'GATEWAY_DEPOSIT',
      category: 'gateway_deposit',
      method: PaymentMethod.GATEWAY,
      templateString: '{GATEWAY} DES:DEPOSIT ID:{PMT_ID} INDN:{COMPANY_NAME}',
      placeholders: [
        {
          name: 'GATEWAY',
          source: PlaceholderSource.RANDOM,
          required: true,
          options: ['STRIPE', 'SQUARE', 'PAYPAL', 'SHOPIFY'],
          formatter: PlaceholderFormatter.UPPERCASE,
        },
        {
          name: 'PMT_ID',
          source: PlaceholderSource.GENERATED,
          generatorType: 'pmtId',
          length: 15,
          required: true,
        },
        {
          name: 'COMPANY_NAME',
          source: PlaceholderSource.COMPANY_INFO,
          field: 'companyName',
          required: true,
          formatter: PlaceholderFormatter.UPPERCASE,
        },
      ],
    });

    this.templates.set('payroll_ACH', {
      type: 'PAYROLL',
      category: 'payroll',
      method: PaymentMethod.ACH,
      templateString: '{CONTRACTOR} DES:PAYROLL ID:{PMT_ID} INDN:{COMPANY_NAME} PAYDATE {PAYDATE}',
      placeholders: [
        {
          name: 'CONTRACTOR',
          source: PlaceholderSource.CONTRACTOR,
          required: true,
          formatter: PlaceholderFormatter.UPPERCASE,
        },
        {
          name: 'PMT_ID',
          source: PlaceholderSource.GENERATED,
          generatorType: 'pmtId',
          length: 9,
          required: true,
        },
        {
          name: 'COMPANY_NAME',
          source: PlaceholderSource.COMPANY_INFO,
          field: 'companyName',
          required: true,
          formatter: PlaceholderFormatter.UPPERCASE,
        },
        {
          name: 'PAYDATE',
          source: PlaceholderSource.DATE,
          dateFormat: 'MMDD',
          required: true,
        },
      ],
    });
  }

  private getGenericTemplate(): Template {
    return {
      type: 'GENERIC',
      category: 'generic',
      method: PaymentMethod.ACH,
      templateString: 'TRANSACTION ID:{PMT_ID}',
      placeholders: [
        {
          name: 'PMT_ID',
          source: PlaceholderSource.GENERATED,
          generatorType: 'pmtId',
          length: 10,
          required: true,
        },
      ],
    };
  }
}

// // ==========================================
// // src/templates/templates.service.ts (исправленный onModuleInit)
// // ==========================================

// import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
// import * as fs from 'fs';
// import { FILE_TEMPLATE_PATH, FILE_NAMES, validateFilePaths } from 'src/shared/constants/filePath';
// import { PaymentMethod } from '../shared/enums/transaction-category.enum';
// import { Template, PlaceholderSource, PlaceholderFormatter } from './interfaces/template.interface';

// @Injectable()
// export class TemplatesService implements OnModuleInit {
//   private readonly logger = new Logger(TemplatesService.name);
//   private templates: Map<string, Template> = new Map();

//   async onModuleInit(): Promise<void> {
//     this.logger.log('🔄 Loading templates...');

//     // Проверяем пути перед загрузкой
//     try {
//       validateFilePaths(console as any);
//     } catch (error) {
//       this.logger.error(`File validation failed: ${error.message}`);
//       // Не падаем, используем дефолтные шаблоны
//     }

//     await this.loadAllTemplates();
//   }

//   private async loadAllTemplates(): Promise<void> {
//     const templateEntries = Object.entries(FILE_TEMPLATE_PATH);
//     let loaded = 0;
//     let failed = 0;

//     for (const [fileName, filePath] of templateEntries) {
//       try {
//         if (!fs.existsSync(filePath)) {
//           this.logger.warn(`⏭️  Template file not found: ${filePath}`);
//           failed++;
//           continue;
//         }

//         const content = fs.readFileSync(filePath, 'utf-8');
//         const template: Template = JSON.parse(content);

//         // Ключ: category_method
//         const key = `${template.category}_${template.method}`;
//         this.templates.set(key, template);

//         this.logger.log(`✅ Loaded: ${fileName} → ${key}`);
//         loaded++;

//       } catch (error) {
//         this.logger.error(`❌ Failed to load ${fileName}: ${error.message}`);
//         failed++;
//       }
//     }

//     this.logger.log(`📊 Templates: ${loaded} loaded, ${failed} failed, ${this.templates.size} total`);

//     // Если ничего не загрузилось - используем дефолтные
//     if (this.templates.size === 0) {
//       this.logger.warn('⚠️  No templates loaded, using defaults');
//       this.loadDefaultTemplates();
//     }
//   }

//   private loadDefaultTemplates(): void {
//     // Дефолтный шаблон для Gateway
//     this.templates.set('gateway_deposit_GATEWAY', {
//       type: 'GATEWAY_DEPOSIT',
//       category: 'gateway_deposit',
//       method: PaymentMethod.GATEWAY,
//       templateString: '{GATEWAY} DES:DEPOSIT ID:{PMT_ID} INDN:{COMPANY_NAME}',
//       placeholders: [
//         {
//           name: 'GATEWAY',
//           source: PlaceholderSource.RANDOM,
//           required: true,
//           options: ['STRIPE', 'SQUARE', 'PAYPAL'],
//           formatter: PlaceholderFormatter.UPPERCASE,
//         },
//         {
//           name: 'PMT_ID',
//           source: PlaceholderSource.GENERATED,
//           generatorType: 'pmtId',
//           length: 15,
//           required: true,
//         },
//         {
//           name: 'COMPANY_NAME',
//           source: PlaceholderSource.COMPANY_INFO,
//           field: 'companyName',
//           required: true,
//           formatter: PlaceholderFormatter.UPPERCASE,
//         },
//       ],
//     });

//     // Дефолтный для Payroll
//     this.templates.set('payroll_ACH', {
//       type: 'PAYROLL',
//       category: 'payroll',
//       method: PaymentMethod.ACH,
//       templateString: '{CONTRACTOR} DES:PAYROLL ID:{PMT_ID} INDN:{COMPANY_NAME} PAYDATE {PAYDATE}',
//       placeholders: [
//         {
//           name: 'CONTRACTOR',
//           source: PlaceholderSource.CONTRACTOR,
//           required: true,
//           formatter: PlaceholderFormatter.UPPERCASE,
//         },
//         {
//           name: 'PMT_ID',
//           source: PlaceholderSource.GENERATED,
//           generatorType: 'pmtId',
//           length: 9,
//           required: true,
//         },
//         {
//           name: 'COMPANY_NAME',
//           source: PlaceholderSource.COMPANY_INFO,
//           field: 'companyName',
//           required: true,
//           formatter: PlaceholderFormatter.UPPERCASE,
//         },
//         {
//           name: 'PAYDATE',
//           source: PlaceholderSource.DATE,
//           dateFormat: 'MMDD',
//           required: true,
//         },
//       ],
//     });

//     this.logger.log('📦 Default templates loaded');
//   }

//   getTemplate(category: string, method: PaymentMethod): Template {
//     const key = `${category}_${method}`;
//     const template = this.templates.get(key);

//     if (!template) {
//       this.logger.warn(`Template not found: ${key}, using generic fallback`);
//       return this.getGenericTemplate();
//     }

//     return template;
//   }

//   private getGenericTemplate(): Template {
//     return {
//       type: 'GENERIC',
//       category: 'generic',
//       method: PaymentMethod.ACH,
//       templateString: '{DESCRIPTION} ID:{PMT_ID}',
//       placeholders: [
//         {
//           name: 'DESCRIPTION',
//           source: PlaceholderSource.STATIC,
//           defaultValue: 'TRANSACTION',
//           required: true,
//         },
//         {
//           name: 'PMT_ID',
//           source: PlaceholderSource.GENERATED,
//           generatorType: 'pmtId',
//           length: 10,
//           required: true,
//         },
//       ],
//     };
//   }

//   render(template: Template, data: Record<string, any>): string {
//     let result = template.templateString;

//     for (const ph of template.placeholders) {
//       const value = this.resolvePlaceholder(ph, data);
//       const formatted = this.applyFormatter(value, ph.formatter);
//       result = result.replace(new RegExp(`\\{${ph.name}\\}`, 'g'), formatted);
//     }

//     result = result.toUpperCase();

//     if (template.maxLength && result.length > template.maxLength) {
//       this.logger.warn(`Description truncated: ${result.length} > ${template.maxLength}`);
//       result = result.substring(0, template.maxLength);
//     }

//     return result;
//   }

//   private resolvePlaceholder(ph: any, data: Record<string, any>): string {
//     switch (ph.source) {
//       case PlaceholderSource.COMPANY_INFO:
//         return data.companyInfo?.[ph.field!] || data[ph.field!] || '';

//       case PlaceholderSource.CONTRACTOR:
//         return data.contractor || 'UNKNOWN';

//       case PlaceholderSource.GENERATED:
//         return data[ph.name.toLowerCase()] || '0'.repeat(ph.length || 10);

//       case PlaceholderSource.RANDOM:
//         const options = ph.options || ['UNKNOWN'];
//         return data[ph.name.toLowerCase()] || options[0];

//       case PlaceholderSource.DATE:
//         return this.formatDate(data.date, ph.dateFormat);

//       case PlaceholderSource.CALCULATION:
//         return data.calculation || '';

//       case PlaceholderSource.CARD:
//         return data.cardLast4 || '0000';

//       case PlaceholderSource.STATIC:
//         return ph.defaultValue || '';

//       default:
//         return data[ph.name.toLowerCase()] || '';
//     }
//   }

//   private formatDate(dateStr: string, format?: string): string {
//     const date = new Date(dateStr);
//     const mm = String(date.getMonth() + 1).padStart(2, '0');
//     const dd = String(date.getDate()).padStart(2, '0');
//     const yy = String(date.getFullYear()).slice(-2);

//     switch (format) {
//       case 'MMDD': return `${mm}${dd}`;
//       case 'MM_DD': return `${mm}/${dd}`;
//       case 'MM/DD/YY': return `${mm}/${dd}/${yy}`;
//       default: return dateStr;
//     }
//   }

//   private applyFormatter(value: string, formatter?: PlaceholderFormatter): string {
//     switch (formatter) {
//       case PlaceholderFormatter.UPPERCASE:
//         return value.toUpperCase();
//       case PlaceholderFormatter.TRUNCATE_30:
//         return value.length > 30 ? value.substring(0, 30) : value;
//       case PlaceholderFormatter.TRUNCATE_40:
//         return value.length > 40 ? value.substring(0, 40) : value;
//       case PlaceholderFormatter.LAST4:
//         return value.slice(-4);
//       default:
//         return value;
//     }
//   }
// }

// // ==========================================
// // src/templates/templates.service.ts (ИСПРАВЛЕННЫЙ)
// // ==========================================

// import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
// import * as fs from 'fs';
// import * as path from 'path';
// // import { FILE_CSV_PATH, FILE_NAMES } from 'src/config/file-paths.config';
// import { PaymentMethod, TemplateType } from 'src/shared/enums/transaction-category.enum';
// import { FILE_CSV_PATH, FILE_NAMES } from 'src/shared/constants/filePath';
// import { PlaceholderConfig, PlaceholderFormatter, PlaceholderSource, Template } from './interfaces/template.interface';

// @Injectable()
// export class TemplatesService implements OnModuleInit {
//   private readonly logger = new Logger(TemplatesService.name);
//   private templates: Map<string, Template> = new Map();

//   async onModuleInit(): Promise<void> {
//     await this.loadAllTemplates();
//   }

//   private async loadAllTemplates(): Promise<void> {
//     const templateFiles = [
//       FILE_NAMES.GATEWAY_DEPOSIT,
//       FILE_NAMES.PAYROLL,
//       FILE_NAMES.CARD_FUEL,
//       FILE_NAMES.CARD_SUBSCRIPTION,
//       FILE_NAMES.CARD_PARTS,
//       FILE_NAMES.ATM_DEPOSIT,
//       FILE_NAMES.CHASSIS_RENTAL,
//       FILE_NAMES.OWNER_TRANSFER,
//       FILE_NAMES.ACH_INCOMING,
//       FILE_NAMES.WIRE_INCOMING,
//       FILE_NAMES.ZELLE,
//     ];

//     for (const fileName of templateFiles) {
//       try {
//         const filePath = FILE_CSV_PATH[fileName as keyof typeof FILE_CSV_PATH];
//         if (!filePath || !fs.existsSync(filePath)) {
//           this.logger.warn(`Template file not found: ${fileName}`);
//           continue;
//         }

//         const content = fs.readFileSync(filePath, 'utf-8');
//         const template: Template = JSON.parse(content);
//         const key = `${template.category}_${template.method}`;
//         this.templates.set(key, template);
//       } catch (error) {
//         this.logger.error(`Failed to load template ${fileName}: ${error.message}`);
//       }
//     }

//     this.logger.log(`Loaded ${this.templates.size} templates`);
//   }

//   getTemplate(category: string, method: PaymentMethod): Template {
//     const key = `${category}_${method}`;
//     const template = this.templates.get(key);

//     if (!template) {
//       this.logger.warn(`Template not found: ${key}, using generic`);
//       return this.getGenericTemplate();
//     }

//     return template;
//   }

//   private getGenericTemplate(): Template {
//     return {
//       type: TemplateType.GATEWAY_DEPOSIT,
//       category: 'generic',
//       method: PaymentMethod.GATEWAY,
//       templateString: '{DESCRIPTION} ID:{PMT_ID}',
//       placeholders: [
//         {
//           name: 'DESCRIPTION',
//           source: PlaceholderSource.STATIC,
//           required: true,
//           defaultValue: 'TRANSACTION',
//         },
//         {
//           name: 'PMT_ID',
//           source: PlaceholderSource.GENERATED,
//           generatorType: 'pmtId',
//           required: true,
//         },
//       ],
//     };
//   }

//   render(template: Template, data: Record<string, any>): string {
//     let result = template.templateString;

//     for (const ph of template.placeholders) {
//       const value = this.resolvePlaceholder(ph, data);
//       const formatted = this.applyFormatter(value, ph.formatter);
//       result = result.replace(new RegExp(`\\{${ph.name}\\}`, 'g'), formatted);
//     }

//     // Все банковские мемо в верхнем регистре
//     result = result.toUpperCase();

//     // Проверка длины
//     if (template.maxLength && result.length > template.maxLength) {
//       this.logger.warn(`Description exceeds maxLength: ${result.length} > ${template.maxLength}`);
//       result = result.substring(0, template.maxLength);
//     }

//     return result;
//   }

//   private resolvePlaceholder(ph: PlaceholderConfig, data: Record<string, any>): string {
//     switch (ph.source) {
//       case PlaceholderSource.COMPANY_INFO:
//         return data.companyInfo?.[ph.field!] || data[ph.field!] || '';

//       case PlaceholderSource.CONTRACTOR:
//         return data.contractor || 'UNKNOWN';

//       case PlaceholderSource.GENERATED:
//         return data[ph.name.toLowerCase()] || this.generatePlaceholder(ph);

//       case PlaceholderSource.RANDOM:
//         return data[ph.name.toLowerCase()] || ph.options?.[0] || '';

//       case PlaceholderSource.DATE:
//         return this.formatDate(data.date, ph.dateFormat);

//       case PlaceholderSource.CALCULATION:
//         return data.calculation || '';

//       case PlaceholderSource.CARD:
//         return data.cardLast4 || '0000';

//       case PlaceholderSource.STATIC:
//         return ph.defaultValue || '';

//       default:
//         return data[ph.name.toLowerCase()] || '';
//     }
//   }

//   private generatePlaceholder(ph: PlaceholderConfig): string {
//     // Этого не должно происходить — все ID должны быть сгенерированы заранее
//     this.logger.warn(`Generating placeholder on-the-fly: ${ph.name}`);
//     return '0'.repeat(ph.length || 10);
//   }

//   private formatDate(dateStr: string, format?: string): string {
//     const date = new Date(dateStr);
//     const mm = String(date.getMonth() + 1).padStart(2, '0');
//     const dd = String(date.getDate()).padStart(2, '0');
//     const yy = String(date.getFullYear()).slice(-2);

//     switch (format) {
//       case 'MMDD':
//         return `${mm}${dd}`;
//       case 'MM/DD':
//         return `${mm}/${dd}`;
//       case 'MM/DD/YY':
//         return `${mm}/${dd}/${yy}`;
//       default:
//         return dateStr;
//     }
//   }

//   private applyFormatter(value: string, formatter?: PlaceholderFormatter): string {
//     switch (formatter) {
//       case PlaceholderFormatter.UPPERCASE:
//         return value.toUpperCase();
//       case PlaceholderFormatter.TRUNCATE_30:
//         return value.length > 30 ? value.substring(0, 30) : value;
//       case PlaceholderFormatter.TRUNCATE_40:
//         return value.length > 40 ? value.substring(0, 40) : value;
//       case PlaceholderFormatter.LAST4:
//         return value.slice(-4);
//       default:
//         return value;
//     }
//   }
// }
