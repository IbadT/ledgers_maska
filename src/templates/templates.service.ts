import { Injectable } from '@nestjs/common';
import { PaymentMethod, TransactionCategory } from 'src/shared/enums/transaction-category.enum';
import { Template } from './entities/template.entity';


// Данные для резолва шаблона
interface TemplateResolutionData {
  contractorName: string;
  // companyInfo: CompanyInfo;
  // transaction: TransactionInput;
  generatedIds: Map<string, string>;   // Уже сгенерированные ID
  cardLast4?: string;
  randomValues: Map<string, string>;   // Для консистентности random
}

@Injectable()
export class TemplatesService {
  // constructor(private readonly loader: TemplatesLoader) {}
  constructor() {}

  async onModuleInit(): Promise<void> {
    // TODO: Implement template loading logic
  }

  getTemplate(category: TransactionCategory, method: PaymentMethod): Template | undefined {
    // TODO: Implement template retrieval logic
    return undefined;
  }

  resolveTemplate(template: Template, data: TemplateResolutionData): string {
    // TODO: Implement template resolution logic
    return '';
  }

  // Замена плейсхолдера на значение
  // private replatePlaceholder(templateString: string, placeholder: PlaceHolderConfig, data: TemplateResolutionData): string {
  //   // TODO: Implement placeholder replacement logic
  //   return templateString;
  // };

  // Применение форматтера
  // private applyFormatter(value: string, formatter: PlaceholderFormatter): string {
  //   // TODO: Implement formatter application logic
  //   return value;
  // };

  // Проверка длины description
  private validateLength(description: string, maxLength?: number): string {
    // TODO: Implement length validation logic
    return description;
  }
}
