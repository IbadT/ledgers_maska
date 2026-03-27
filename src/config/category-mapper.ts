// ==========================================
// src/config/category-mapper.ts
// ==========================================

export interface CategoryMapping {
  technicalCategory: string;
  templateType: string;
  requiresContractor: boolean;
  csvFile?: string;
  methodOverride?: string; // Для исправления ACH_DEBIT на GATEWAY
}

export const CATEGORY_MAP: Record<string, CategoryMapping> = {
  'Gateway Income': {
    technicalCategory: 'gateway_deposit',
    templateType: 'GATEWAY_DEPOSIT',
    requiresContractor: false,
    methodOverride: 'GATEWAY', // ⚠️ Ключевое исправление!
  },
  Payroll: {
    technicalCategory: 'payroll',
    templateType: 'PAYROLL',
    requiresContractor: true,
    csvFile: 'payroll_providers',
    methodOverride: 'ACH',
  },
  Fuel: {
    technicalCategory: 'card_fuel',
    templateType: 'CARD_FUEL',
    requiresContractor: true,
    csvFile: 'merchants',
  },
  'Gas Station': {
    technicalCategory: 'card_fuel',
    templateType: 'GASSTATION_CHECKCARD',
    requiresContractor: true,
    csvFile: 'merchants',
  },
  'Chassis Rental': {
    technicalCategory: 'chassis_rental',
    templateType: 'CHASSIS_RENTAL',
    requiresContractor: true,
    csvFile: 'chassis_providers',
  },
  'Owner Transfer': {
    technicalCategory: 'owner_transfer',
    templateType: 'OWNER_TRANSFER',
    requiresContractor: false,
  },
  Zelle: {
    technicalCategory: 'zelle_incoming',
    templateType: 'ZELLE_TRANSFER',
    requiresContractor: false,
  },
  Wire: {
    technicalCategory: 'wire_incoming',
    templateType: 'WIRE_INCOMING',
    requiresContractor: true,
    csvFile: 'banks_wire',
  },
  'ATM Deposit': {
    technicalCategory: 'atm_deposit',
    templateType: 'ATM_DEPOSIT',
    requiresContractor: false,
    csvFile: 'atm_cities',
  },
  'Mobile Payment': {
    technicalCategory: 'mobile_payment',
    templateType: 'PURCHASE_MOBILE',
    requiresContractor: true,
    csvFile: 'mobile_operators',
  },
  'Utility Payment': {
    technicalCategory: 'utility_payment',
    templateType: 'PURCHASE_UTILITY',
    requiresContractor: true,
    csvFile: 'utilities',
  },
  'Insurance Payment': {
    technicalCategory: 'insurance_payment',
    templateType: 'ACH_INSURANCE',
    requiresContractor: true,
    csvFile: 'insurance',
  },
  'Marketing Payment': {
    technicalCategory: 'marketing_payment',
    templateType: 'ACH_MARKETING',
    requiresContractor: true,
    csvFile: 'marketing',
  },
};
