// ==========================================
// src/maska/dto/matematika-payload.dto.ts
// ==========================================

import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
  Length,
  MaxLength,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod, TransactionType } from '../../shared/enums/transaction-category.enum';

// ВХОДНОЙ формат от Matematika (ваш формат)
export class ForwardingInfoInputDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  companyName: string;

  @IsString()
  @IsNotEmpty()
  ownerName: string;

  @IsString()
  @IsOptional()
  @Length(2, 2)
  state?: string; // ⚠️ ДОЛЖНО ПРИХОДИТЬ, иначе дефолт "CA"

  @IsString()
  @IsOptional()
  @Length(4, 4)
  accountNumber?: string;

  @IsString()
  @IsNotEmpty()
  associatedCard: string; // Полный номер "2091222000102910"

  // ⚠️ Ваш формат: массив объектов → трансформируем
  @IsArray()
  @IsOptional()
  customContractors?: any[];

  // ⚠️ Ваш формат: массив объектов → трансформируем
  @IsArray()
  @IsOptional()
  customCustomers?: any[];

  @IsOptional()
  persistentContractors?: Record<string, string>;

  constructor(
    companyName: string,
    ownerName: string,
    associatedCard: string,
    state?: string,
    accountNumber?: string,
    customContractors?: any[],
    customCustomers?: any[],
    persistentContractors?: Record<string, string>,
  ) {
    this.companyName = companyName;
    this.ownerName = ownerName;
    this.state = state;
    this.accountNumber = accountNumber;
    this.associatedCard = associatedCard;
    this.customContractors = customContractors;
    this.customCustomers = customCustomers;
    this.persistentContractors = persistentContractors;
  }
}

export class SummaryDto {
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

  constructor(
    finalBalance: number,
    initialBalance: number,
    netProfit: number,
    totalExpenses: number,
    totalRevenue: number,
  ) {
    this.finalBalance = finalBalance;
    this.initialBalance = initialBalance;
    this.netProfit = netProfit;
    this.totalExpenses = totalExpenses;
    this.totalRevenue = totalRevenue;
  }
}

export class MatematikaPayloadDto {
  @IsString()
  @IsNotEmpty()
  jobId: string;

  @IsString()
  @IsNotEmpty()
  @IsDateString()
  generatedAt: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DailyBalanceDto)
  dailyBalances: DailyBalanceDto[];

  @ValidateNested()
  @Type(() => ForwardingInfoInputDto)
  forwardingInfo: ForwardingInfoInputDto;

  @ValidateNested()
  @Type(() => SummaryDto)
  summary: SummaryDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransactionInputDto)
  transactions: TransactionInputDto[];

  constructor(
    jobId: string,
    generatedAt: string,
    dailyBalances: DailyBalanceDto[],
    forwardingInfo: ForwardingInfoInputDto,
    summary: SummaryDto,
    transactions: TransactionInputDto[],
  ) {
    this.jobId = jobId;
    this.generatedAt = generatedAt;
    this.dailyBalances = dailyBalances;
    this.forwardingInfo = forwardingInfo;
    this.summary = summary;
    this.transactions = transactions;
  }
}

export class DailyBalanceDto {
  @IsNumber()
  @IsNotEmpty()
  balance: number;

  @IsString()
  @IsNotEmpty()
  @IsDateString()
  date: string;

  constructor(balance: number, date: string) {
    this.balance = balance;
    this.date = date;
  }
}

export class CalculationDetailsDto {
  @IsNumber()
  quantity: number;

  @IsNumber()
  rate: number;

  @IsString()
  unit: string;

  constructor(quantity: number, rate: number, unit: string) {
    this.quantity = quantity;
    this.rate = rate;
    this.unit = unit;
  }
}

export class TransactionInputDto {
  @IsUUID()
  @IsNotEmpty()
  transactionId: string;

  @IsString()
  @IsNotEmpty()
  @IsDateString()
  transactionDate: string;

  @IsString()
  @IsNotEmpty()
  @IsDateString()
  postingDate: string; // "2026-03-09T00:00:00Z" → трансформируем

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsNumber()
  @IsNotEmpty()
  balanceAfter: number;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  method: PaymentMethod;

  @IsBoolean()
  @IsNotEmpty()
  isManual: boolean;

  @IsString()
  @IsNotEmpty()
  // @IsIn(['income', 'expense'])
  @IsIn(Object.values(TransactionType))
  type: TransactionType;

  @IsNumber()
  @IsOptional()
  contractorIndex?: number;

  @IsBoolean()
  @IsOptional()
  FixAsFirst?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => CalculationDetailsDto)
  calculationDetails?: CalculationDetailsDto;

  @IsString()
  @IsOptional()
  associatedCard?: string;

  constructor(
    transactionId: string,
    transactionDate: string,
    postingDate: string,
    amount: number,
    balanceAfter: number,
    category: string,
    method: PaymentMethod,
    isManual: boolean,
    type: TransactionType,
    contractorIndex?: number,
    fixAsFirst?: boolean,
    calculationDetails?: CalculationDetailsDto,
    associatedCard?: string,
  ) {
    this.transactionId = transactionId;
    this.transactionDate = transactionDate;
    this.postingDate = postingDate;
    this.amount = amount;
    this.balanceAfter = balanceAfter;
    this.category = category;
    this.method = method;
    this.isManual = isManual;
    this.type = type;
    this.contractorIndex = contractorIndex;
    this.FixAsFirst = fixAsFirst;
    this.calculationDetails = calculationDetails;
    this.associatedCard = associatedCard;
  }
}
