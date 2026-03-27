import { Injectable, Logger } from '@nestjs/common';
import { MaskPattern, ParsedTemplate } from './interfaces/template.interface';

@Injectable()
export class MaskPatternParserService {
  private readonly logger = new Logger(MaskPatternParserService.name);

  /**
   * Парсит шаблонную строку и извлекает паттерны &синтаксиса
   * Пример: "PAYCHEX DES:PAYROLL ID:&NUMUP{985[1-9]{12}} INDN:&PERNAM PAYDATE &DAT{YYYY-MM-DD}"
   */
  parseTemplate(templateString: string): ParsedTemplate {
    this.logger.debug(`Parsing template: ${templateString}`);

    const patterns: MaskPattern[] = [];
    const staticParts: string[] = [];
    let currentIndex = 0;

    // Ручной парсинг для корректной обработки вложенных скобок
    let i = 0;
    while (i < templateString.length) {
      if (templateString[i] === '&') {
        // Добавляем статическую часть до этого паттерна
        if (i > currentIndex) {
          staticParts.push(templateString.substring(currentIndex, i));
        }

        // Находим имя символа (буквы до { или конца)
        let symbolName = '';
        let j = i + 1;
        while (j < templateString.length && templateString[j] !== '{' && templateString[j] !== ' ' && templateString[j] !== '\t') {
          symbolName += templateString[j];
          j++;
        }

        // Проверяем, есть ли правила в {скобках}
        let rules = '';
        if (j < templateString.length && templateString[j] === '{') {
          // Ищем закрывающую скобку с учетом вложенности
          let braceCount = 1;
          let k = j + 1;
          while (k < templateString.length && braceCount > 0) {
            if (templateString[k] === '{') {
              braceCount++;
            } else if (templateString[k] === '}') {
              braceCount--;
            }
            k++;
          }
          
          if (braceCount === 0) {
            // Извлекаем правила без внешних скобок
            rules = templateString.substring(j + 1, k - 1);
            j = k; // Перемещаем индекс после закрывающей скобки
          }
        }

        const fullMatch = templateString.substring(i, j);
        this.logger.debug(`Parsed pattern: symbol="${symbolName}", rules="${rules}", full="${fullMatch}"`);
        
        const pattern: MaskPattern = {
          type: this.getPatternType(symbolName),
          name: symbolName,
          originalCase: fullMatch.substring(1), // Сохраняем регистр без &
          ...(rules && { rules }),
        };

        this.logger.debug(`Created pattern: type=${pattern.type}, name=${pattern.name}, rules=${pattern.rules}`);

        patterns.push(pattern);
        currentIndex = j;
        i = j;
      } else {
        i++;
      }
    }

    // Добавляем последнюю статическую часть
    if (currentIndex < templateString.length) {
      staticParts.push(templateString.substring(currentIndex));
    }

    this.logger.debug(`Found ${patterns.length} patterns, ${staticParts.length} static parts`);

    return {
      originalString: templateString,
      patterns,
      staticParts,
    };
  }

  /**
   * Определяет тип паттерна по имени символа
   */
  private getPatternType(symbolName: string): MaskPattern['type'] {
    const upperName = symbolName.toUpperCase();

    switch (upperName) {
      case 'NUMUP':
        return 'sequential';
      case 'PERNAM':
        return 'company_name';
      case 'DAT':
        return 'date';
      case 'MERCHTNAME':
        return 'merchant';
      case 'MERCHADDYSTATECODE':
        return 'state_code';
      case 'ATTCHPHONENUMBER':
        return 'phone_number';

      case 'ATMID':
        return 'atm_id';

      case 'ATTCHCARDLAST4':
        return 'card_last4';
      default:
        // Для обратной совместимости пытаемся определить по префиксам
        if (upperName.includes('DATE') || upperName.includes('DAT')) {
          return 'date';
        }
        if (upperName.includes('MERCHANT') || upperName.includes('MERCH')) {
          return 'merchant';
        }
        if (upperName.includes('STATE') || upperName.includes('CODE')) {
          return 'state_code';
        }
        if (upperName.includes('CARD') || upperName.includes('LAST4')) {
          return 'card_last4';
        }
        if (upperName.includes('NUM') || upperName.includes('ID')) {
          return 'sequential';
        }
        return 'company_name'; // По умолчанию
    }
  }

  /**
   * Проверяет, содержит ли шаблон &синтаксис
   */
  hasMaskSyntax(templateString: string): boolean {
    return /&[A-Z]+(\{[^}]*\})?/i.test(templateString);
  }

  /**
   * Определяет форматирование регистра по оригинальному имени
   */
  determineCaseFormat(originalCase: string): 'auto' | 'upper' | 'lower' | 'title' | 'asis' {
    if (originalCase === originalCase.toUpperCase()) {
      return 'upper';
    } else if (originalCase === originalCase.toLowerCase()) {
      return 'lower';
    } else if (originalCase.split('').every((char, index) => 
        index === 0 || char === char.toUpperCase() || char === char.toLowerCase()
    )) {
      // Проверяем на TitleCase (первая буква заглавная, остальные могут быть строчными)
      return 'title';
    } else {
      // Смешанный регистр - как есть
      return 'asis';
    }
  }
}
