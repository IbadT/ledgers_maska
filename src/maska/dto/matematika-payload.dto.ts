export class MatematikaPayloadDto {
  jobId: string;
  generatedAt: string;
  dailyBalances: DailyBalance[];
  forwardingInfo: ForwardingInfo;
  summary: Summary;
  transactions: Transaction[];
}

export class DailyBalance {
  balance: number;
  date: string;
}

export class ForwardingInfo {
  associatedCard: string;
  companyName: string;
  customContractors: CustomContractor[];
  customCustomers: CustomCustomer[];
  ownerName: string;
}

export class CustomContractor {
  name: string;
  transactionType: string;
}

export class CustomCustomer {
  category: string;
  name: string;
}

export class Summary {
  finalBalance: number;
  initialBalance: number;
  netProfit: number;
  totalExpenses: number;
  totalRevenue: number;
}

export class Transaction {
  amount: number;
  balanceAfter: number;
  category: string;
  isManual: boolean;
  method: string;
  postingDate: string; // 2026-03-01T00:00:00Z
  transactionDate: string; // 2026-03-01T14:50:00Z
  transactionId: string; // bf60727a-258a-4eb1-9e66-e4643db7fde0
  type: string;
}
