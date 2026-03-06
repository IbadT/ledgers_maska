// ==========================================
// src/shared/constants/filePath.ts (ИСПРАВЛЕННЫЙ)
// ==========================================

import * as path from 'path';

// ==========================================
// ИМЕНА ФАЙЛОВ (как в файловой системе!)
// ==========================================

export const FILE_NAMES = {
  // CSV файлы (проверено - совпадают)
  ATM_CITIES: 'atm_cities.csv',
  BANKS_WIRE: 'banks_wire.csv',
  BOOKKEEPER_CA: 'bookkeeper_ca.csv',
  BOOKKEEPER_TX: 'bookkeeper_tx.csv',
  CHASSIS_PROVIDERS: 'chassis_providers.csv',
  FLEET_CA: 'fleet_ca.csv',
  FLEET_TX: 'fleet_tx.csv',
  GATEWAYS: 'gateways.csv',
  INSURANCE: 'insurance.csv',
  MARKETING: 'marketing.csv',
  MOBILE_OPERATORS: 'mobile_operators.csv',
  PARTS_STORES: 'parts_stores.csv',
  PAYROLL_PROVIDERS: 'payroll_providers.csv',
  RETAILS_CA: 'retails_ca.csv',
  RETAILS_TX: 'retails_tx.csv',
  SOFTWARE_TRANSPORT: 'software_transport.csv',
  UTILITIES: 'utilities.csv',

  // TEMPLATES (ИСПРАВЛЕНЫ дефисы и опечатки!)
  ACH_INCOMING: 'ach-incoming.json', // был: ach_invoming.json
  ATM_DEPOSIT: 'atm-deposit.json', // был: atm_deposit.json
  CARD_FUEL: 'card-fuel.json', // был: card_fuel.json
  CARD_PARTS: 'card-parts.json', // был: card_parts.json
  CARD_SUBSCRIPTION: 'card-subscription.json', // был: card_subscription.json
  CHASSIS_RENTAL: 'chassis-rental.json', // был: chassis_rental.json
  CHECKCARD_GENERIC: 'checkcard-generic.json', // был: checkcard_generic.json
  GATEWAY_DEPOSIT: 'gateway-deposit.json', // был: gateway_deposit.json
  INTERNAL_TRANSFER: 'internal-transfer.json', // был: internal_transfer.json
  IRS_PAYMENT: 'irs-payment.json', // был: irs_payment.json
  OWNER_TRANSFER: 'owner-transfer.json', // был: owner_transfer.json
  PAYROLL: 'payroll.json', // ✓ совпадает
  PURCHASE_GENERIC: 'purchase-generic.json', // был: purchase_generic.json
  PURCHASE_MOBILE: 'purchase-mobile.json', // был: purchase_mobile.json
  PURCHASE_UTILITY: 'purchase-utility.json', // был: purchase_utility.json
  WIRE_INCOMING: 'wire-incoming.json', // был: wire_incoming.json
  ZELLE: 'zelle.json', // был: zille.json (опечатка!)
} as const;

// ==========================================
// БАЗОВАЯ ДИРЕКТОРИЯ (исправлено для NestJS)
// ==========================================

// Для разработки (ts-node): используем process.cwd()
// Для production (compiled): используем __dirname относительно dist
const isCompiled = __dirname.includes('dist');
const BASE_DIR = isCompiled
  ? path.join(__dirname, '..', '..', '..') // dist/src/shared/constants → корень
  : process.cwd();

// ==========================================
// ПУТИ К CSV (src/assets/csv/)
// ==========================================

export const FILE_CSV_PATH: Record<string, string> = {
  [FILE_NAMES.ATM_CITIES]: path.join(BASE_DIR, 'src', 'assets', 'csv', FILE_NAMES.ATM_CITIES),
  [FILE_NAMES.BANKS_WIRE]: path.join(BASE_DIR, 'src', 'assets', 'csv', FILE_NAMES.BANKS_WIRE),
  [FILE_NAMES.BOOKKEEPER_CA]: path.join(BASE_DIR, 'src', 'assets', 'csv', FILE_NAMES.BOOKKEEPER_CA),
  [FILE_NAMES.BOOKKEEPER_TX]: path.join(BASE_DIR, 'src', 'assets', 'csv', FILE_NAMES.BOOKKEEPER_TX),
  [FILE_NAMES.CHASSIS_PROVIDERS]: path.join(BASE_DIR, 'src', 'assets', 'csv', FILE_NAMES.CHASSIS_PROVIDERS),
  [FILE_NAMES.FLEET_CA]: path.join(BASE_DIR, 'src', 'assets', 'csv', FILE_NAMES.FLEET_CA),
  [FILE_NAMES.FLEET_TX]: path.join(BASE_DIR, 'src', 'assets', 'csv', FILE_NAMES.FLEET_TX),
  [FILE_NAMES.GATEWAYS]: path.join(BASE_DIR, 'src', 'assets', 'csv', FILE_NAMES.GATEWAYS),
  [FILE_NAMES.INSURANCE]: path.join(BASE_DIR, 'src', 'assets', 'csv', FILE_NAMES.INSURANCE),
  [FILE_NAMES.MARKETING]: path.join(BASE_DIR, 'src', 'assets', 'csv', FILE_NAMES.MARKETING),
  [FILE_NAMES.MOBILE_OPERATORS]: path.join(BASE_DIR, 'src', 'assets', 'csv', FILE_NAMES.MOBILE_OPERATORS),
  [FILE_NAMES.PARTS_STORES]: path.join(BASE_DIR, 'src', 'assets', 'csv', FILE_NAMES.PARTS_STORES),
  [FILE_NAMES.PAYROLL_PROVIDERS]: path.join(BASE_DIR, 'src', 'assets', 'csv', FILE_NAMES.PAYROLL_PROVIDERS),
  [FILE_NAMES.RETAILS_CA]: path.join(BASE_DIR, 'src', 'assets', 'csv', FILE_NAMES.RETAILS_CA),
  [FILE_NAMES.RETAILS_TX]: path.join(BASE_DIR, 'src', 'assets', 'csv', FILE_NAMES.RETAILS_TX),
  [FILE_NAMES.SOFTWARE_TRANSPORT]: path.join(BASE_DIR, 'src', 'assets', 'csv', FILE_NAMES.SOFTWARE_TRANSPORT),
  [FILE_NAMES.UTILITIES]: path.join(BASE_DIR, 'src', 'assets', 'csv', FILE_NAMES.UTILITIES),
};

// ==========================================
// ПУТИ К TEMPLATES (src/assets/templates/)
// ==========================================

export const FILE_TEMPLATE_PATH: Record<string, string> = {
  [FILE_NAMES.ACH_INCOMING]: path.join(BASE_DIR, 'src', 'assets', 'templates', FILE_NAMES.ACH_INCOMING),
  [FILE_NAMES.ATM_DEPOSIT]: path.join(BASE_DIR, 'src', 'assets', 'templates', FILE_NAMES.ATM_DEPOSIT),
  [FILE_NAMES.CARD_FUEL]: path.join(BASE_DIR, 'src', 'assets', 'templates', FILE_NAMES.CARD_FUEL),
  [FILE_NAMES.CARD_PARTS]: path.join(BASE_DIR, 'src', 'assets', 'templates', FILE_NAMES.CARD_PARTS),
  [FILE_NAMES.CARD_SUBSCRIPTION]: path.join(BASE_DIR, 'src', 'assets', 'templates', FILE_NAMES.CARD_SUBSCRIPTION),
  [FILE_NAMES.CHASSIS_RENTAL]: path.join(BASE_DIR, 'src', 'assets', 'templates', FILE_NAMES.CHASSIS_RENTAL),
  [FILE_NAMES.CHECKCARD_GENERIC]: path.join(BASE_DIR, 'src', 'assets', 'templates', FILE_NAMES.CHECKCARD_GENERIC),
  [FILE_NAMES.GATEWAY_DEPOSIT]: path.join(BASE_DIR, 'src', 'assets', 'templates', FILE_NAMES.GATEWAY_DEPOSIT),
  [FILE_NAMES.INTERNAL_TRANSFER]: path.join(BASE_DIR, 'src', 'assets', 'templates', FILE_NAMES.INTERNAL_TRANSFER),
  [FILE_NAMES.IRS_PAYMENT]: path.join(BASE_DIR, 'src', 'assets', 'templates', FILE_NAMES.IRS_PAYMENT),
  [FILE_NAMES.OWNER_TRANSFER]: path.join(BASE_DIR, 'src', 'assets', 'templates', FILE_NAMES.OWNER_TRANSFER),
  [FILE_NAMES.PAYROLL]: path.join(BASE_DIR, 'src', 'assets', 'templates', FILE_NAMES.PAYROLL),
  [FILE_NAMES.PURCHASE_GENERIC]: path.join(BASE_DIR, 'src', 'assets', 'templates', FILE_NAMES.PURCHASE_GENERIC),
  [FILE_NAMES.PURCHASE_MOBILE]: path.join(BASE_DIR, 'src', 'assets', 'templates', FILE_NAMES.PURCHASE_MOBILE),
  [FILE_NAMES.PURCHASE_UTILITY]: path.join(BASE_DIR, 'src', 'assets', 'templates', FILE_NAMES.PURCHASE_UTILITY),
  [FILE_NAMES.WIRE_INCOMING]: path.join(BASE_DIR, 'src', 'assets', 'templates', FILE_NAMES.WIRE_INCOMING),
  [FILE_NAMES.ZELLE]: path.join(BASE_DIR, 'src', 'assets', 'templates', FILE_NAMES.ZELLE),
};

// ==========================================
// УТИЛИТА: Проверка существования файлов
// ==========================================

import * as fs from 'fs';

export function validateFilePaths(logger?: Console): void {
  const allPaths = { ...FILE_CSV_PATH, ...FILE_TEMPLATE_PATH };
  const missing: string[] = [];
  const found: string[] = [];

  for (const [name, filePath] of Object.entries(allPaths)) {
    if (fs.existsSync(filePath)) {
      found.push(name);
    } else {
      missing.push(`${name} → ${filePath}`);
    }
  }

  if (logger) {
    logger.log(`✅ Found ${found.length} files`);
    if (missing.length > 0) {
      logger.error(`❌ Missing ${missing.length} files:`);
      missing.forEach((m) => logger.error(`   ${m}`));
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing files: ${missing.join(', ')}`);
  }
}

// import * as path from 'path';

// export const FILE_NAMES = {
//   // CSV
//   ATM_CITIES: 'atc_cities.csv',
//   BANKS_WIRE: 'banks_wire.csv',
//   BOOKKEEPER_CA: 'bookkeeper_ca.csv',
//   BOOKKEEPER_TX: 'bookkeeper_tx.csv',
//   CHASSIS_PROVIDERS: 'chassis_providers.csv',
//   FLEET_CA: 'fleet_ca.csv',
//   FLEET_TX: 'fleet_tx.csv',
//   GATEWAYS: 'gateways.csv',
//   INSURANCE: 'insurance.csv',
//   MARKETING: 'marketing.csv',
//   MOBILE_OPERATORS: 'mobile_operators.csv',
//   PARTS_STORES: 'parts_stores.csv',
//   PAYROLL_PROVIDERS: 'payroll_providers.csv',
//   RETAILS_CA: 'retails_ca.csv',
//   RETAILS_TX: 'retails_tx.csv',
//   SOFTWARE_TRANSPORT: 'software_transport.csv',
//   UTILITIES: 'utilities.csv',

//   // TEMPLATES
//   ACH_INCOMING: 'ach_invoming.json',
//   ATM_DEPOSIT: 'atm_deposit.json',
//   CARD_FUEL: 'card_fuel.json',
//   CARD_PARTS: 'card_parts.json',
//   CARD_SUBSCRIPTION: 'card_subscription.json',
//   CHASSIS_RENTAL: 'chassis_rental.json',
//   CHECKCARD_GENERIC: 'checkcard_generic.json',
//   GATEWAY_DEPOSIT: 'gateway_deposit.json',
//   INTERNAL_TRANSFER: 'internal_transfer.json',
//   IRS_PAYMENT: 'irs_payment.json',
//   OWNER_TRANSFER: 'owner_transfer.json',
//   PAYROLL: 'payroll.json',
//   PURCHASE_GENERIC: 'purchase_generic.json',
//   PURCHASE_MOBILE: 'purchase_mobile.json',
//   PURCHASE_UTILITY: 'purchase_utility.json',
//   WIRE_INCOMING: 'wire_incoming.json',
//   ZELLE: 'zille.json',
// };

// export const FILE_TEMPLATE_PATH = {};

// const BASE_DIR = process.cwd();

// export const FILE_CSV_PATH = {
//   // CSV
//   [FILE_NAMES.ATM_CITIES]: path.join(BASE_DIR, 'src', 'assets', 'csv', FILE_NAMES.ATM_CITIES),
//   [FILE_NAMES.BANKS_WIRE]: path.join(BASE_DIR, 'src', 'assets', 'csv', FILE_NAMES.BANKS_WIRE),
//   [FILE_NAMES.BOOKKEEPER_CA]: path.join(BASE_DIR, 'src', 'assets', 'csv', FILE_NAMES.BOOKKEEPER_CA),
//   [FILE_NAMES.BOOKKEEPER_TX]: path.join(BASE_DIR, 'src', 'assets', 'csv', FILE_NAMES.BOOKKEEPER_TX),
//   [FILE_NAMES.CHASSIS_PROVIDERS]: path.join(
//     BASE_DIR,
//     'src',
//     'assets',
//     'csv',
//     FILE_NAMES.CHASSIS_PROVIDERS,
//   ),
//   [FILE_NAMES.FLEET_CA]: path.join(BASE_DIR, 'src', 'assets', 'csv', FILE_NAMES.FLEET_CA),
//   [FILE_NAMES.FLEET_TX]: path.join(BASE_DIR, 'src', 'assets', 'csv', FILE_NAMES.FLEET_TX),
//   [FILE_NAMES.GATEWAYS]: path.join(BASE_DIR, 'src', 'assets', 'csv', FILE_NAMES.GATEWAYS),
//   [FILE_NAMES.INSURANCE]: path.join(BASE_DIR, 'src', 'assets', 'csv', FILE_NAMES.INSURANCE),
//   [FILE_NAMES.MARKETING]: path.join(BASE_DIR, 'src', 'assets', 'csv', FILE_NAMES.MARKETING),
//   [FILE_NAMES.MOBILE_OPERATORS]: path.join(
//     BASE_DIR,
//     'src',
//     'assets',
//     'csv',
//     FILE_NAMES.MOBILE_OPERATORS,
//   ),
//   [FILE_NAMES.PARTS_STORES]: path.join(BASE_DIR, 'src', 'assets', 'csv', FILE_NAMES.PARTS_STORES),
//   [FILE_NAMES.PAYROLL_PROVIDERS]: path.join(
//     BASE_DIR,
//     'src',
//     'assets',
//     'csv',
//     FILE_NAMES.PAYROLL_PROVIDERS,
//   ),
//   [FILE_NAMES.RETAILS_CA]: path.join(BASE_DIR, 'src', 'assets', 'csv', FILE_NAMES.RETAILS_CA),
//   [FILE_NAMES.RETAILS_TX]: path.join(BASE_DIR, 'src', 'assets', 'csv', FILE_NAMES.RETAILS_TX),
//   [FILE_NAMES.SOFTWARE_TRANSPORT]: path.join(
//     BASE_DIR,
//     'src',
//     'assets',
//     'csv',
//     FILE_NAMES.SOFTWARE_TRANSPORT,
//   ),
//   [FILE_NAMES.UTILITIES]: path.join(BASE_DIR, 'src', 'assets', 'csv', FILE_NAMES.UTILITIES),

//   //   TEMPLATES
//   [FILE_NAMES.ACH_INCOMING]: path.join(
//     BASE_DIR,
//     'src',
//     'assets',
//     'templates',
//     FILE_NAMES.ACH_INCOMING,
//   ),
//   [FILE_NAMES.ATM_DEPOSIT]: path.join(
//     BASE_DIR,
//     'src',
//     'assets',
//     'templates',
//     FILE_NAMES.ATM_DEPOSIT,
//   ),
//   [FILE_NAMES.CARD_FUEL]: path.join(BASE_DIR, 'src', 'assets', 'templates', FILE_NAMES.CARD_FUEL),
//   [FILE_NAMES.CARD_PARTS]: path.join(BASE_DIR, 'src', 'assets', 'templates', FILE_NAMES.CARD_PARTS),
//   [FILE_NAMES.CARD_SUBSCRIPTION]: path.join(
//     BASE_DIR,
//     'src',
//     'assets',
//     'templates',
//     FILE_NAMES.CARD_SUBSCRIPTION,
//   ),
//   [FILE_NAMES.CHASSIS_RENTAL]: path.join(
//     BASE_DIR,
//     'src',
//     'assets',
//     'templates',
//     FILE_NAMES.CHASSIS_RENTAL,
//   ),
//   [FILE_NAMES.CHECKCARD_GENERIC]: path.join(
//     BASE_DIR,
//     'src',
//     'assets',
//     'templates',
//     FILE_NAMES.CHECKCARD_GENERIC,
//   ),
//   [FILE_NAMES.GATEWAY_DEPOSIT]: path.join(
//     BASE_DIR,
//     'src',
//     'assets',
//     'templates',
//     FILE_NAMES.GATEWAY_DEPOSIT,
//   ),
//   [FILE_NAMES.INTERNAL_TRANSFER]: path.join(
//     BASE_DIR,
//     'src',
//     'assets',
//     'templates',
//     FILE_NAMES.INTERNAL_TRANSFER,
//   ),
//   [FILE_NAMES.IRS_PAYMENT]: path.join(
//     BASE_DIR,
//     'src',
//     'assets',
//     'templates',
//     FILE_NAMES.IRS_PAYMENT,
//   ),
//   [FILE_NAMES.OWNER_TRANSFER]: path.join(
//     BASE_DIR,
//     'src',
//     'assets',
//     'templates',
//     FILE_NAMES.OWNER_TRANSFER,
//   ),
//   [FILE_NAMES.PAYROLL]: path.join(BASE_DIR, 'src', 'assets', 'templates', FILE_NAMES.PAYROLL),
//   [FILE_NAMES.PURCHASE_GENERIC]: path.join(
//     BASE_DIR,
//     'src',
//     'assets',
//     'templates',
//     FILE_NAMES.PURCHASE_GENERIC,
//   ),
//   [FILE_NAMES.PURCHASE_MOBILE]: path.join(
//     BASE_DIR,
//     'src',
//     'assets',
//     'templates',
//     FILE_NAMES.PURCHASE_MOBILE,
//   ),
//   [FILE_NAMES.PURCHASE_UTILITY]: path.join(
//     BASE_DIR,
//     'src',
//     'assets',
//     'templates',
//     FILE_NAMES.PURCHASE_UTILITY,
//   ),
//   [FILE_NAMES.WIRE_INCOMING]: path.join(
//     BASE_DIR,
//     'src',
//     'assets',
//     'templates',
//     FILE_NAMES.WIRE_INCOMING,
//   ),
//   [FILE_NAMES.ZELLE]: path.join(BASE_DIR, 'src', 'assets', 'templates', FILE_NAMES.ZELLE),
// };
