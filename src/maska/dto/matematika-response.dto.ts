import { IsDate, IsDateString, IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";


export class MaskaResponseDto {
    transactions: TransactionResponseDto[];
}

export class TransactionResponseDto {

    @IsString()
    @IsNotEmpty()
    @IsDate()
    transactionDate: string;

    @IsString()
    @IsNotEmpty()
    @IsDateString()
    postingDate: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @IsNumber()
    @IsNotEmpty()
    balanceAfter: number;
};

export class FindncialSummaryResponse {
    companyName: string;
    accountNumber: string;
    period: string;
    initialBalance: number;
    finalBalance: number;

    totals: TotalResponse;

    revenueBreakdown: RevenueBreakdownResponse;

    expensesBreakdown: ExpensesBreakdownResponse;

    transactionCount: TransactionCountResponse;

    dailyClosingBalances: DailyClosingBalancesResponse;
}


export class TotalResponse {
    @IsNumber()
    @IsNotEmpty()
    totalRevenue: number;
    
    @IsNumber()
    @IsNotEmpty()
    totalExpenses: number;
    
    @IsNumber()
    @IsNotEmpty()
    netProfit: number;
}

export class RevenueBreakdownResponse {
    @IsNumber()
    @IsNotEmpty()
    totalAch: number;
    
    @IsNumber()
    @IsNotEmpty()
    totalWire: number;
    
    @IsNumber()
    @IsNotEmpty()
    totalZelle: number;
    
    @IsNumber()
    @IsNotEmpty()
    totalGateway: number;
    
    @IsNumber()
    @IsNotEmpty()
    totalOther: number;
}

export class ExpensesBreakdownResponse {
    @IsNumber()
    @IsNotEmpty()
    byCard: number;
    
    @IsNumber()
    @IsNotEmpty()
    byAccount: number;
    
    @IsNumber()
    @IsNotEmpty()
    byOther: number;
}

export class TransactionCountResponse {
    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    total: number;
    
    deposits: DepositsResponse;
    withdrawals: WithdrawalsResponse;
}

export class DepositsResponse {
    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    total: number;
    
    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    ach: number;
    
    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    wire: number;
    
    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    zelle: number;
}

export class WithdrawalsResponse {
    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    total: number;
    
    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    fromAccount: number;
    
    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    byCard: number;
}

export class DailyClosingBalancesResponse {
    @IsString()
    @IsNotEmpty()
    @IsDateString()
    date: string;
    
    @IsNumber()
    @IsNotEmpty()
    balance: number;
}
