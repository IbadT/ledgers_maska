// ==========================================
// src/contractors/contractors.service.ts (ИСПРАВЛЕННЫЙ)
// ==========================================

import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ContractorsService {
  private readonly logger = new Logger(ContractorsService.name);
  private csvCache: Map<string, string[]> = new Map();
  private readonly CSV_DIR = path.join(process.cwd(), 'src', 'assets', 'csv');

  // async loadContractors(category: string, state: string): Promise<string[]> {
  loadContractors(category: string, state: string): string[] {
    const fileName = this.resolveCsvFileName(category, state);
    const cacheKey = `${category}_${state}`;

    if (this.csvCache.has(cacheKey)) {
      return this.csvCache.get(cacheKey)!;
    }

    const filePath = path.join(this.CSV_DIR, fileName);
    this.logger.log(`📂 Loading CSV: ${filePath}`);

    try {
      if (!fs.existsSync(filePath)) {
        this.logger.warn(`⏭️  CSV not found: ${filePath}, using defaults`);
        const defaults = this.getDefaultContractors(category);
        this.csvCache.set(cacheKey, defaults);
        return defaults;
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').filter((line) => line.trim());

      // Пропускаем заголовок, берём первую колонку
      const contractors = lines
        .slice(1)
        .map((line) => line.split(',')[0].trim())
        .filter((name) => name.length > 0);

      this.logger.log(`✅ Loaded ${contractors.length} contractors from ${fileName}`);

      this.csvCache.set(cacheKey, contractors);
      return contractors;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Failed to load ${fileName}: ${errorMessage}`);
      return this.getDefaultContractors(category);
    }
  }

  mergeWithCustom(
    defaults: string[],
    customs: string[],
    category: string,
  ): { merged: string[]; mapping: Map<number, number> } {
    if (customs.length > defaults.length) {
      this.logger.error(`Too many custom contractors: ${customs.length} > ${defaults.length}`);
      throw new Error(`Custom contractors exceed limit for ${category}`);
    }

    const merged = [...defaults];
    const mapping = new Map<number, number>();

    for (let i = 0; i < customs.length; i++) {
      mapping.set(i, i);
      merged[i] = customs[i];
    }

    return { merged, mapping };
  }

  getRandomFromCsv(fileName: string): string {
    const filePath = path.join(this.CSV_DIR, `${fileName}.csv`);

    try {
      if (!fs.existsSync(filePath)) {
        this.logger.warn(`CSV not found for random: ${filePath}`);
        return this.getDefaultForFile(fileName);
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').filter((line) => line.trim());
      const items = lines
        .slice(1)
        .map((line) => line.split(',')[0].trim())
        .filter(Boolean);

      return items[Math.floor(Math.random() * items.length)] || 'UNKNOWN';
    } catch {
      return this.getDefaultForFile(fileName);
    }
  }

  private resolveCsvFileName(category: string, state: string): string {
    const map: Record<string, string> = {
      gateway_deposit: 'gateways.csv',
      payroll: 'payroll_providers.csv',
      card_fuel: `fleet_${state.toLowerCase()}.csv`,
      chassis_rental: 'chassis_providers.csv',
      atm_deposit: 'atm_cities.csv',
      wire_incoming: 'banks_wire.csv',
    };

    return map[category] || 'gateways.csv';
  }

  private getDefaultContractors(category: string): string[] {
    const defaults: Record<string, string[]> = {
      gateway_deposit: ['STRIPE', 'SQUARE', 'PAYPAL', 'SHOPIFY'],
      payroll: ['ADP', 'PAYCHEX', 'GUSTO'],
      card_fuel: ['CHEVRON', 'SHELL', 'EXXONMOBIL', 'BP'],
      chassis_rental: ['TRITON INTL', 'DCLI', 'FLEXLEASE'],
    };

    return defaults[category] || ['UNKNOWN'];
  }

  private getDefaultForFile(fileName: string): string {
    const map: Record<string, string> = {
      gateways: 'STRIPE',
      payroll_providers: 'ADP',
      fleet_ca: 'CHEVRON',
      fleet_tx: 'CHEVRON',
    };
    return map[fileName] || 'UNKNOWN';
  }

  clearCache(): void {
    this.csvCache.clear();
  }
}

// // ==========================================
// // src/contractors/contractors.service.ts (ИСПРАВЛЕННЫЙ)
// // ==========================================

// import { Injectable, Logger } from '@nestjs/common';
// import * as fs from 'fs';
// import * as path from 'path';
// import { FILE_CSV_PATH, FILE_NAMES } from 'src/shared/constants/filePath';
// // import { FILE_CSV_PATH, FILE_NAMES } from 'src/config/file-paths.config';

// @Injectable()
// export class ContractorsService {
//   private readonly logger = new Logger(ContractorsService.name);
//   private csvCache: Map<string, string[]> = new Map();

//   async loadContractors(category: string, state: string): Promise<string[]> {
//     const fileName = this.resolveCsvFileName(category, state);
//     const cacheKey = `${category}_${state}`;

//     if (this.csvCache.has(cacheKey)) {
//       return this.csvCache.get(cacheKey)!;
//     }

//     try {
//       const filePath = FILE_CSV_PATH[fileName as keyof typeof FILE_CSV_PATH];
//       if (!filePath || !fs.existsSync(filePath)) {
//         this.logger.warn(`CSV file not found: ${fileName}, using defaults`);
//         const defaults = this.getDefaultContractors(category);
//         this.csvCache.set(cacheKey, defaults);
//         return defaults;
//       }

//       const content = fs.readFileSync(filePath, 'utf-8');
//       const lines = content.split('\n').filter(line => line.trim());
//       // Пропускаем заголовок, берём первую колонку
//       const contractors = lines.slice(1).map(line => line.split(',')[0].trim()).filter(Boolean);

//       this.csvCache.set(cacheKey, contractors);
//       return contractors;
//     } catch (error) {
//       this.logger.error(`Failed to load ${fileName}: ${error.message}`);
//       return this.getDefaultContractors(category);
//     }
//   }

//   mergeWithCustom(
//     defaults: string[],
//     customs: string[],
//     category: string,
//   ): { merged: string[]; mapping: Map<number, number> } {
//     // ⚠️ ТЗ: "не больше одного пользовательского на одного дефолтного"
//     if (customs.length > defaults.length) {
//       this.logger.error(`Custom contractors exceed defaults: ${customs.length} > ${defaults.length}`);
//       throw new Error(`Too many custom contractors for ${category}`);
//     }

//     const merged = [...defaults];
//     const mapping = new Map<number, number>();

//     // Заменяем первые N дефолтных на custom
//     for (let i = 0; i < customs.length; i++) {
//       mapping.set(i, i);
//       merged[i] = customs[i];
//     }

//     return { merged, mapping };
//   }

//   getRandomFromCsv(fileName: string): string {
//     // Для случайного выбора без привязки к индексу (gateway, city и т.д.)
//     const defaults = this.getDefaultContractors(fileName);
//     return defaults[Math.floor(Math.random() * defaults.length)];
//   }

//   private resolveCsvFileName(category: string, state: string): string {
//     const map: Record<string, string> = {
//       gateway_deposit: FILE_NAMES.GATEWAYS,
//       payroll: FILE_NAMES.PAYROLL_PROVIDERS,
//       card_fuel: FILE_NAMES.FLEET_CA,  // TODO: динамический штат
//       chassis_rental: FILE_NAMES.CHASSIS_PROVIDERS,
//       atm_deposit: FILE_NAMES.ATM_CITIES,
//     };
//     return map[category] || FILE_NAMES.GATEWAYS;
//   }

//   private getDefaultContractors(category: string): string[] {
//     const defaults: Record<string, string[]> = {
//       [FILE_NAMES.GATEWAYS]: ['STRIPE', 'SQUARE', 'PAYPAL', 'SHOPIFY'],
//       [FILE_NAMES.PAYROLL_PROVIDERS]: ['ADP', 'PAYCHEX', 'GUSTO'],
//       [FILE_NAMES.FLEET_CA]: ['CHEVRON', 'SHELL', 'EXXONMOBIL', 'BP'],
//       [FILE_NAMES.FLEET_TX]: ['CHEVRON', 'SHELL', 'EXXON', 'VALERO'],
//       [FILE_NAMES.CHASSIS_PROVIDERS]: ['TRITON INTL', 'DCLI', 'FLEXLEASE'],
//       [FILE_NAMES.ATM_CITIES]: ['MODESTO', 'FRESNO', 'BAKERSFIELD', 'STOCKTON'],
//       [FILE_NAMES.RETAILS_CA]: ['SUNRISE FARMS', 'PACIFIC TRADERS', 'FRESH FARMS CO-OP'],
//       [FILE_NAMES.SOFTWARE_TRANSPORT]: ['HLUHULU', 'ADOBE', 'QUICKBOOKS', 'OMNITRACS'],
//     };
//     return defaults[category] || ['UNKNOWN'];
//   }

//   clearCache(): void {
//     this.csvCache.clear();
//   }
// }

// import { Injectable } from '@nestjs/common';

// @Injectable()
// export class ContractorsService {
//     private csvCache: Map<string, string[]> = new Map();

//     async loadContractors(category: string, state: string): Promise<string[]> {
//         const fileName = this.resolveCsvFileName(category, state);
//         const cacheKey = `${category}_${state}`;

//         if (this.csvCache.has(cacheKey)) {
//             return this.csvCache.get(cacheKey)!;
//         }

//         // TODO: Реализовать чтение файла
//         const defaults = this.getDefaultContractors(category);
//         this.csvCache.set(cacheKey, defaults);
//         return defaults;
//     }

//     mergeWithCustom(
//         defaults: string[],
//         customs: string[],
//         category: string
//     ): { merged: string[]; mapping: Map<number, number> } {
//         const merged = [...defaults];
//         const mapping = new Map<number, number>();

//         for(let i = 0; i < Math.min(customs.length, defaults.length); i++) {
//             mapping.set(i, i);
//             merged[i] = customs[i]
//         };

//         return { merged, mapping };
//     };

//     getRandomFromCsv(fileName: string): string {
//         const options = this.getDefaultContractors(fileName);
//         return options[Math.floor(Math.random() * options.length)];
//     };

//     private resolveCsvFileName(category: string, state: string): string {
//         const map: Record<string, string> = {
//             gateway_deposit: "getaways",
//             payroll: "payroll_providers",
//             card_fuel: `fleet_${state.toLowerCase()}`,
//         }
//         return map[category] || "generic";
//     };

//     private getDefaultContractors(category: string): string[] {
//         const defaults: Record<string, string[]> = {
//             gateways: ["STRIPE", "SQUARE", "PAYPAL", "SHOPIFY"],
//             payroll_providers: ["ADP", "PAYCHEX", "GUSTO"],
//             fleet_ca: ["CHEVRON", "SHELL", "EXXONMOBIL", "BP"],
//         };

//         return defaults[category] || ["UNKNOWN"];
//     }
// }
