// src/shared/enums/transaction-category.enum.ts

export enum TransactionCategory {
  // Доходы
  INCOMING_ACH = 'incoming_ach',
  WIRE_INCOMING = 'wire_incoming',
  GATEWAY_DEPOSIT = 'gateway_deposit',
  ZELLE_INCOMING = 'zelle_incoming',
  INTERNAL_TRANSFER_IN = 'internal_transfer_in',

  // Расходы
  PAYROLL = 'payroll',
  IRS_PAYMENT = 'irs_payment',
  OWNER_TRANSFER = 'owner_transfer',
  FUEL = 'fuel',
  CHASSIS_RENTAL = 'chassis_rental',
  SOFTWARE_SUBSCRIPTION = 'software_subscription',
  MOBILE_PHONE = 'mobile_phone',
  UTILITIES = 'utilities',
  INSURANCE = 'insurance',
  MARKETING = 'marketing',
  PARTS_POS = 'parts_pos',
  BOOKKEEPER = 'bookkeeper',

  // Карточные операции
  CARD_FUEL = 'card_fuel',
  CARD_SUBSCRIPTION = 'card_subscription',
  CARD_PARTS = 'card_parts',
  ATM_DEPOSIT = 'atm_deposit',
  ATM_WITHDRAWAL = 'atm_withdrawal',
}

export enum PaymentMethod {
  ACH = 'ACH',
  ACH_DEBIT = 'ACH_DEBIT',
  WIRE = 'WIRE',
  CHECKCARD = 'CHECKCARD',
  PURCHASE = 'PURCHASE',
  ZELLE = 'ZELLE',
  INTERNAL = 'INTERNAL',
  GATEWAY = 'GATEWAY',
  CASH = 'CASH',
  ATM = 'ATM',
}

export enum TemplateType {
  ACH_INCOMING = 'ACH_INCOMING',
  ACH_OUTGOING = 'ACH_OUTGOING',
  WIRE_INCOMING = 'WIRE_INCOMING',
  GATEWAY_DEPOSIT = 'GATEWAY_DEPOSIT',
  PAYROLL = 'PAYROLL',
  IRS_PAYMENT = 'IRS_PAYMENT',
  ZELLE_TRANSFER = 'ZELLE_TRANSFER',
  ATM_DEPOSIT = 'ATM_DEPOSIT',
  ATM_WITHDRAWAL = 'ATM_WITHDRAWAL',
  INTERNAL_TRANSFER = 'INTERNAL_TRANSFER',
  OWNER_TRANSFER = 'OWNER_TRANSFER',
  CHASSIS_RENTAL = 'CHASSIS_RENTAL',
  CARD_CHECKCARD = 'CARD_CHECKCARD',
  CARD_PURCHASE = 'CARD_PURCHASE',
}

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}
