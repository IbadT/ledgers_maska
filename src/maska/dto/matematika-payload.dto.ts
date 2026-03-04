import { IsArray, IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";
import { PaymentMethod } from "src/shared/enums/transaction-category.enum";

export class MatematikaPayloadDto {
  @IsString()
  @IsNotEmpty()
  jobId: string;
  
  @IsString()
  @IsNotEmpty()
  generatedAt: string;
  
  dailyBalances: DailyBalance[];
  
  forwardingInfo: ForwardingInfo;
  
  summary: Summary;
  
  @IsArray()
  transactions: Transaction[];
}

export class DailyBalance {
  @IsNumber()
  @IsNotEmpty()
  balance: number;

  @IsString()
  @IsNotEmpty()
  @IsDateString()
  date: string;
}

export class ForwardingInfo {
  @IsString()
  @IsNotEmpty()
  associatedCard: string;
  
  @IsString()
  @IsNotEmpty()
  companyName: string;
  
  @IsArray()
  customContractors: CustomContractor[];
  
  @IsArray()
  customCustomers: CustomCustomer[];
  
  @IsString()
  @IsNotEmpty()
  ownerName: string;
}

export class CustomContractor {
  @IsString()
  @IsNotEmpty()
  name: string;
  
  // TODO: возможно это enum
  @IsString()
  @IsNotEmpty()
  transactionType: string;
}

export class CustomCustomer {
  @IsString()
  @IsNotEmpty()
  category: string;
  
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class Summary {
  @IsNumber()
  @IsNotEmpty()
  finalBalance: number;
  
  @IsNumber()
  @IsNotEmpty()
  initialBalance: number;
  
  @IsNumber()
  @IsNotEmpty()
  netProfit: number;
  
  @IsNumber()
  @IsNotEmpty()
  totalExpenses: number;
  
  @IsNumber()
  @IsNotEmpty()
  totalRevenue: number;
}

export class Transaction {
  @IsNumber()
  @IsNotEmpty()
  amount: number;
  
  @IsNumber()
  @IsNotEmpty()
  balanceAfter: number;
  
  @IsString()
  @IsNotEmpty()
  category: string;
  
  @IsBoolean()
  @IsNotEmpty()
  isManual: boolean;
  
  @IsString()
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  method: string;
  
  @IsString()
  @IsNotEmpty()
  postingDate: string; // 2026-03-01T00:00:00Z
  
  @IsString()
  @IsNotEmpty()
  transactionDate: string; // 2026-03-01T14:50:00Z
  
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  transactionId: string; // bf60727a-258a-4eb1-9e66-e4643db7fde0
  
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsBoolean()
  @IsOptional()
  FixAsFirst?: boolean // TODO: добавить после анализа matematika
}





// ====================
// src/modules/maska/interfaces/maska-input.interface.ts

// export interface MaskaInputDto {
//   transactions: TransactionInput[];
//   forwardingInfo: ForwardingInfo;
//   dailyBalances?: DailyBalance[];      // Опционально, для справки
//   summary?: MonthSummary;              // Опционально, для справки
// }

// export interface TransactionInput {
//   transactionId: string;
//   transactionDate: string;             // ISO 8601
//   postingDate: string;                 // YYYY-MM-DD
//   amount: number;
//   balanceAfter: number;
//   category: TransactionCategory;       // Техническая категория
//   method: PaymentMethod;               // Способ платежа
//   isManual: boolean;
//   contractorIndex?: number;            // Индекс для выбора контрагента
//   associatedCard?: string;             // Последние 4 цифры или полный номер
//   calculationDetails?: CalculationDetails; // Для аренды шасси и т.п.
//   FixAsFirst?: boolean;                // Для сортировки
// }

// export interface ForwardingInfo {
//   companyInfo: CompanyInfo;
//   customCustomers?: string[];          // Пользовательские клиенты (доходы)
//   customContractors?: Record<string, string[]>; // Категория → подрядчики
//   persistentContractors?: Record<string, string>; // "Зелёные" контрагенты
//   cards?: string[];                    // Последние 4 цифры карт
// }

export interface CompanyInfo {
  companyName: string;                 // INDN в шаблонах (max 40 симв.)
  ownerName?: string;                  // Для Zelle и подписей
  state: string;                       // CA, TX и т.д. — для выбора CSV
  accountNumber?: string;              // Для внутренних переводов (последние 4)
}

export interface CalculationDetails {
  quantity: number;
  rate: number;
  unit: string;                        // HR, LB, MI и т.д.
}

// export interface DailyBalance {
//   date: string;                        // YYYY-MM-DD
//   balance: number;
// }

export interface MonthSummary {
  initialBalance: number;
  finalBalance: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
}