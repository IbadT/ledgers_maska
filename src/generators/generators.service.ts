// ==========================================
// src/generators/generators.service.ts (ПОЛНОСТЬЮ ИСПРАВЛЕННЫЙ)
// ==========================================

import { Injectable, Logger } from '@nestjs/common';
import { GeneratorContext } from 'src/maska/interfaces/maska.types';

@Injectable()
export class GeneratorsService {
  private readonly logger = new Logger(GeneratorsService.name);

  createContext(): GeneratorContext {
    this.logger.debug('Creating new generator context');
    return {
      pmtIdCache: new Set(),
      confirmCache: new Set(),
      coIdCache: new Map(),
    };
  }

  generatePmtId(ctx: GeneratorContext): string {
    this.logger.debug('Generating PMT_ID...');

    let attempts = 0;
    let id: string;

    do {
      id = this.randomNumeric(15);
      attempts++;
    } while (ctx.pmtIdCache.has(id) && attempts < 100);

    if (attempts >= 100) {
      this.logger.error('Failed to generate unique PMT_ID after 100 attempts');
      throw new Error('PMT_ID generation failed');
    }

    ctx.pmtIdCache.add(id);
    this.logger.debug(`Generated PMT_ID: ${id} (attempt ${attempts})`);
    return id;
  }

  generateCoId(contractorName: string, ctx: GeneratorContext): string {
    this.logger.debug(`Generating CO_ID for: ${contractorName}`);

    // Детерминированно: если уже есть — возвращаем
    if (ctx.coIdCache.has(contractorName)) {
      const existing = ctx.coIdCache.get(contractorName)!;
      this.logger.debug(`Reusing existing CO_ID: ${existing}`);
      return existing;
    }

    const id = this.randomNumeric(10);
    ctx.coIdCache.set(contractorName, id);
    this.logger.debug(`Generated new CO_ID: ${id}`);
    return id;
  }

  generateConfirmNumber(ctx: GeneratorContext): string {
    this.logger.debug('Generating CONFIRM number...');

    let attempts = 0;
    let id: string;

    do {
      id = this.randomNumeric(10);
      attempts++;
    } while (ctx.confirmCache.has(id) && attempts < 100);

    ctx.confirmCache.add(id);
    this.logger.debug(`Generated CONFIRM: ${id}`);
    return id;
  }

  // generateAtmId(ctx: GeneratorContext): string {
  generateAtmId(): string {
    return this.randomNumeric(8);
  }

  private randomNumeric(length: number): string {
    // ⚠️ ПРОВЕРКА: не используем '0'.repeat!
    const digits = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += digits[Math.floor(Math.random() * 10)];
    }
    return result;
  }

  cleanup(ctx: GeneratorContext): void {
    this.logger.debug(`Cleaning up: ${ctx.pmtIdCache.size} PMT IDs, ${ctx.coIdCache.size} CO IDs`);
    ctx.pmtIdCache.clear();
    ctx.confirmCache.clear();
    ctx.coIdCache.clear();
  }
}

// import { Injectable } from '@nestjs/common';
// import { GeneratorContext } from 'src/maska/interfaces/forwarding-info.interface';

// @Injectable()
// export class GeneratorsService {
//   createContext(): GeneratorContext {
//     return {
//       pmtIdCache: new Set(),
//       confirmCache: new Set(),
//       coIdCache: new Map(),
//     }
//   };

//   generatePmtId(ctx: GeneratorContext): string {
//     let id: string;
//     do {
//       id = this.randomNumeric(15);
//     } while (ctx.pmtIdCache.has(id));
//     ctx.pmtIdCache.add(id);
//     return id;
//   };

//   generateCoId(contractorName: string, ctx: GeneratorContext): string {
//     if (ctx.coIdCache.has(contractorName)) {
//       return ctx.coIdCache.get(contractorName)!;
//     }
//     const id = this.randomNumeric(10);
//     ctx.coIdCache.set(contractorName, id);
//     return id;
//   };

//   generateConfirmNumber(ctx: GeneratorContext): string {
//     let id: string;
//     do {
//       id = this.randomNumeric(10);
//     } while (ctx.confirmCache.has(id));
//     ctx.confirmCache.add(id);
//     return id;
//   };

//   private randomNumeric(length: number): string {
//     return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
//   };

//   cleanup(ctx: GeneratorContext) {
//     ctx.pmtIdCache.clear();
//     ctx.confirmCache.clear();
//     ctx.coIdCache.clear();
//   }
// }
