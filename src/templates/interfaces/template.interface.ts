// ==========================================
// src/templates/interfaces/template.interface.ts
// ==========================================

export enum PlaceholderSource {
  CONTRACTOR = 'contractor',
  COMPANY_INFO = 'companyInfo',
  GENERATED = 'generated',
  RANDOM = 'random',
  DATE = 'date',
  CALCULATION = 'calculation',
  CARD = 'card',
  STATIC = 'static',
}

export enum PlaceholderFormatter {
  UPPERCASE = 'uppercase',
  TRUNCATE_30 = 'truncate_30',
  TRUNCATE_40 = 'truncate_40',
  LAST4 = 'last4',
}

export interface PlaceholderConfig {
  name: string;
  source: PlaceholderSource;
  required: boolean;
  field?: string; // Для COMPANY_INFO
  generatorType?: string; // Для GENERATED
  length?: number; // Для GENERATED
  options?: string[]; // Для RANDOM
  dateFormat?: string; // Для DATE
  defaultValue?: string; // Для STATIC
  formatter?: PlaceholderFormatter;
}

export interface Template {
  type: string;
  category: string;
  method: string;
  templateString: string;
  placeholders: PlaceholderConfig[];
  maxLength?: number;
  example?: string;
}
