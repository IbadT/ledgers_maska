import { ForwardingInfoInputDto } from '../dto/matematika-payload.dto';
import {
  DailyClosingBalanceDto,
  FinancialSummaryDto,
  MaskaResponseDto,
  MaskedTransactionDto,
} from '../dto/matematika-response.dto';
import { ForwardingInfo } from '../interfaces/maska.types';

export interface IOutputMaskaResponse {
  financialSummary: FinancialSummaryDto;
  transactions: MaskedTransactionDto[];
  balances: DailyClosingBalanceDto[];
}

export const outputMaskaResponse = ({
  financialSummary,
  transactions,
  balances,
}: IOutputMaskaResponse): MaskaResponseDto => {
  return {
    financialSummary,
    transactions,
    dailyClosingBalances: balances.map((b: DailyClosingBalanceDto) => ({
      date: b.date,
      balance: b.balance,
    })),
    generatedAt: new Date().toISOString(),
  };
};

export interface IOutputTransformForwardingInfo {
  info: ForwardingInfoInputDto;
  customContractors: Record<string, string[]>;
  customCustomers: string[];
}

export const outputTransformForwardingInfo = ({
  info,
  customContractors,
  customCustomers,
}: IOutputTransformForwardingInfo): ForwardingInfo => {
  return {
    companyInfo: {
      companyName: info.companyName,
      ownerName: info.ownerName,
      state: info.state || 'CA', // ⚠️ Дефолт, но должно приходить!
      accountNumber: info.accountNumber || info.associatedCard?.slice(-4) || '2910',
    },
    cards: [info.associatedCard?.slice(-4) || '2910'],
    customContractors,
    customCustomers,
    persistentContractors: info.persistentContractors || {},
  };
};
