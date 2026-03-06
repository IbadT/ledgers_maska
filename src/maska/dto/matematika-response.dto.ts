// ==========================================
// src/maska/dto/matematika-response.dto.ts
// ==========================================

import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  ValidateNested,
  Matches,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MaskaResponseDto {
  @ValidateNested()
  @Type(() => FinancialSummaryDto)
  financialSummary: FinancialSummaryDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaskedTransactionDto)
  transactions: MaskedTransactionDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DailyClosingBalanceDto)
  dailyClosingBalances: DailyClosingBalanceDto[];

  @IsString()
  @IsNotEmpty()
  @IsDateString()
  generatedAt: string;

  constructor(
    financialSummary: FinancialSummaryDto,
    transactions: MaskedTransactionDto[],
    dailyClosingBalances: DailyClosingBalanceDto[],
    generatedAt: string,
  ) {
    this.financialSummary = financialSummary;
    this.transactions = transactions;
    this.dailyClosingBalances = dailyClosingBalances;
    this.generatedAt = generatedAt;
  }
}

export class MaskedTransactionDto {
  @IsString()
  @IsNotEmpty()
  @IsDateString()
  transactionDate: string; // ISO 8601 сохраняем

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  postingDate: string; // YYYY-MM-DD строго!

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  description: string; // Сформированное мемо

  @IsNumber()
  amount: number;

  @IsNumber()
  balanceAfter: number;

  constructor(transactionDate: string, postingDate: string, description: string, amount: number, balanceAfter: number) {
    this.transactionDate = transactionDate;
    this.postingDate = postingDate;
    this.description = description;
    this.amount = amount;
    this.balanceAfter = balanceAfter;
  }
}

export class FinancialSummaryDto {
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsNotEmpty()
  accountNumber: string; // Последние 4 цифры

  @IsString()
  @IsNotEmpty()
  period: string; // "2026-03-01 - 2026-03-31"

  @IsNumber()
  initialBalance: number;

  @IsNumber()
  finalBalance: number;

  @ValidateNested()
  @Type(() => TotalDto)
  totals: TotalDto;

  @ValidateNested()
  @Type(() => RevenueBreakdownDto)
  revenueBreakdown: RevenueBreakdownDto;

  @ValidateNested()
  @Type(() => ExpensesBreakdownDto)
  expensesBreakdown: ExpensesBreakdownDto;

  @ValidateNested()
  @Type(() => TransactionCountDto)
  transactionCount: TransactionCountDto;

  constructor(
    companyName: string,
    accountNumber: string,
    period: string,
    initialBalance: number,
    finalBalance: number,
    totals: TotalDto,
    revenueBreakdown: RevenueBreakdownDto,
    expensesBreakdown: ExpensesBreakdownDto,
    transactionCount: TransactionCountDto,
  ) {
    this.companyName = companyName;
    this.accountNumber = accountNumber;
    this.period = period;
    this.initialBalance = initialBalance;
    this.finalBalance = finalBalance;
    this.totals = totals;
    this.revenueBreakdown = revenueBreakdown;
    this.expensesBreakdown = expensesBreakdown;
    this.transactionCount = transactionCount;
  }
}

export class TotalDto {
  @IsNumber()
  totalRevenue: number;

  @IsNumber()
  totalExpenses: number;

  @IsNumber()
  netProfit: number;

  constructor(totalRevenue: number, totalExpenses: number, netProfit: number) {
    this.totalRevenue = totalRevenue;
    this.totalExpenses = totalExpenses;
    this.netProfit = netProfit;
  }
}

export class RevenueBreakdownDto {
  @IsNumber()
  totalAch: number;

  @IsNumber()
  totalWire: number;

  @IsNumber()
  totalZelle: number;

  @IsNumber()
  totalGateway: number;

  @IsNumber()
  totalOther: number;

  constructor(totalAch: number, totalWire: number, totalZelle: number, totalGateway: number, totalOther: number) {
    this.totalAch = totalAch;
    this.totalWire = totalWire;
    this.totalZelle = totalZelle;
    this.totalGateway = totalGateway;
    this.totalOther = totalOther;
  }
}

export class ExpensesBreakdownDto {
  @IsNumber()
  byCard: number;

  @IsNumber()
  byAccount: number;

  constructor(byCard: number, byAccount: number) {
    this.byCard = byCard;
    this.byAccount = byAccount;
  }
}

export class TransactionCountDto {
  @IsNumber()
  @IsPositive()
  total: number;

  @ValidateNested()
  @Type(() => DepositsDto)
  deposits: DepositsDto;

  @ValidateNested()
  @Type(() => WithdrawalsDto)
  withdrawals: WithdrawalsDto;

  constructor(total: number, deposits: DepositsDto, withdrawals: WithdrawalsDto) {
    this.total = total;
    this.deposits = deposits;
    this.withdrawals = withdrawals;
  }
}

export class DepositsDto {
  @IsNumber()
  @IsPositive()
  total: number;

  @IsNumber()
  @IsPositive()
  ach: number;

  @IsNumber()
  @IsPositive()
  wire: number;

  @IsNumber()
  @IsPositive()
  zelle: number;

  constructor(total: number, ach: number, wire: number, zelle: number) {
    this.total = total;
    this.ach = ach;
    this.wire = wire;
    this.zelle = zelle;
  }
}

export class WithdrawalsDto {
  @IsNumber()
  @IsPositive()
  total: number;

  @IsNumber()
  @IsPositive()
  fromAccount: number;

  @IsNumber()
  @IsPositive()
  byCard: number;

  constructor(total: number, fromAccount: number, byCard: number) {
    this.total = total;
    this.fromAccount = fromAccount;
    this.byCard = byCard;
  }
}

export class DailyClosingBalanceDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date: string;

  @IsNumber()
  balance: number;

  constructor(date: string, balance: number) {
    this.date = date;
    this.balance = balance;
  }
}
