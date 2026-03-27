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
  MERCHANT = 'merchant',
  STATE_CODE = 'stateCode',
  SEQUENTIAL_NUMBER = 'sequentialNumber',
}

export enum PlaceholderFormatter {
  UPPERCASE = 'uppercase',
  TRUNCATE_30 = 'truncate_30',
  TRUNCATE_40 = 'truncate_40',
  LAST4 = 'last4',
  TITLE_CASE = 'title_case',
  LOWERCASE = 'lowercase',
  AS_IS = 'as_is',
  AUTO_CASE = 'auto_case', // Определить по регистру имени плейсхолдера
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
  // Новые поля для &синтаксиса
  pattern?: string; // Для SEQUENTIAL_NUMBER - regex паттерн
  caseFormat?: 'auto' | 'upper' | 'lower' | 'title' | 'asis'; // Формат регистра из имени
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

// Новые интерфейсы для &синтаксиса
export interface MaskPattern {
  type: 'sequential' | 'date' | 'merchant' | 'state_code' | 'card_last4' | 'company_name' | 'phone_number' | 'atm_id';
  name: string; // Имя без & (например, NUMUP, PERNAM, DAT)
  rules?: string; // Содержимое в {} (например, "985[1-9]{12}")
  originalCase: string; // Оригинальный регистр имени для определения форматирования
}

export interface ParsedTemplate {
  originalString: string;
  patterns: MaskPattern[];
  staticParts: string[];
}
