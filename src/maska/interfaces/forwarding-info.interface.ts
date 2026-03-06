export interface ForwardingInfo {
  companyInfo: {
    companyName: string;
    ownerName: string;
    state: string;
    accountNumber?: string;
  };
  cards: string[];
  customContractors: Record<string, string[]>;
  customCustomers: string[];
  persistentContractors?: Record<string, string>;
}

export interface ProcessingContext {
  companyInfo: ForwardingInfo['companyInfo'];
  generators: GeneratorContext;
  contractorCache: Map<string, string[]>;
  coIdCache: Map<string, string>;
  forwardingInfo: ForwardingInfo;
}

export interface GeneratorContext {
  pmtIdCache: Set<string>;
  confirmCache: Set<string>;
  coIdCache: Map<string, string>;
}

export interface MaskedTransaction {
  transactionDate: string;
  postingDate: string;
  description: string;
  amount: number;
  balanceAfter: number;
  _originalCategory?: string;
  _templateType?: string;
}
