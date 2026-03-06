export interface TemplateData {
  companyInfo: {
    companyName: string;
    ownerName: string;
    state: string;
    accountNumber?: string;
  };
  date: string;
  cardLast4: string;
  pmtId: string;
  coId: string;
  confirm: string;
  contractor?: string;
  gateway?: string;
  paydate?: string;
}
