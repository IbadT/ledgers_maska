// ==========================================
// src/maska/interfaces/maska.types.ts
// ==========================================

export interface CompanyInfo {
  companyName: string; // INDN в шаблонах (max 40 симв.)
  ownerName: string; // Для Zelle: фамилия, имя
  state: string; // CA, TX — для выбора CSV!
  accountNumber?: string; // Последние 4 цифры для переводов
}

export interface ForwardingInfo {
  companyInfo: CompanyInfo;
  cards: string[]; // ["2910"] — последние 4 цифры
  customContractors: Record<string, string[]>; // {"fuel": ["LumNuft"]}
  customCustomers: string[]; // ["Client 1", "Client 2"]
  persistentContractors?: Record<string, string>; // "Зелёные" контрагенты
}

export interface GeneratorContext {
  pmtIdCache: Set<string>; // Уникальность Pmt ID
  confirmCache: Set<string>; // Уникальность Confirm#
  coIdCache: Map<string, string>; // contractorName → CO ID (детерминированно!)
}

export interface ProcessingContext {
  companyInfo: CompanyInfo;
  forwardingInfo: ForwardingInfo;
  generators: GeneratorContext;
  contractorCache: Map<string, string[]>; // category_state → контрагенты
  coIdCache: Map<string, string>; // Уже сгенерированные CO ID
  randomCache: Map<string, string>; // Для консистентности random
}

export interface CalculationDetails {
  quantity: number;
  rate: number;
  unit: string; // "HR", "LB", "MI"
}

// Входная транзакция от Matematika (после трансформации)
export interface TransactionInput {
  transactionId: string;
  transactionDate: string; // ISO 8601
  postingDate: string; // YYYY-MM-DD (обрезано!)
  amount: number;
  balanceAfter: number;
  category: string; // "Gateway Income" — маппится на technical
  method: string; // "ACH_DEBIT" — может меняться
  isManual: boolean;
  type: 'income' | 'expense'; // Для определения направления
  FixAsFirst?: boolean; // Для сортировки
  contractorIndex?: number; // Индекс для выбора контрагента
  calculationDetails?: CalculationDetails;
  associatedCard?: string; // Последние 4 цифры карты
}

// Выходная замаскированная транзакция
export interface MaskedTransaction {
  transactionDate: string; // ISO 8601
  postingDate: string; // YYYY-MM-DD
  description: string; // СФОРМИРОВАННОЕ МЕМО
  amount: number; // Без изменений
  balanceAfter: number; // Без изменений
  // Технические для отладки (не в ответе клиенту)
  _originalCategory?: string;
  _templateType?: string;
  _transactionId?: string;
}
