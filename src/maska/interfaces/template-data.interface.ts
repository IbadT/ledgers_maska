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
  // Новые поля для &синтаксиса
  merchantName?: string;
  stateCode?: string;
  sequentialNumbers?: Map<string, number>; // Для хранения счетчиков NUMUP
}
