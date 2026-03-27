import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SequentialGeneratorService {
  private readonly logger = new Logger(SequentialGeneratorService.name);
  private counters: Map<string, number> = new Map();

  /**
   * Генерирует следующий номер для заданного паттерна
   * Пример: pattern = "985[1-9]{12}", counterKey = "payroll_numup"
   */
  generateSequential(pattern: string, counterKey: string): string {
    this.logger.debug(`Generating sequential number for pattern: ${pattern.substring(0, 20)}..., key: ${counterKey}`);

    // Получаем текущий счетчик или начинаем с 1
    let currentCounter = this.counters.get(counterKey) || 0;
    currentCounter++;
    this.counters.set(counterKey, currentCounter);

    this.logger.debug(`Counter before pattern: ${currentCounter}`);

    // Генерируем номер по паттерну
    const result = this.applyPattern(pattern, currentCounter);
    
    this.logger.debug(`Generated: ${result.substring(0, 20)}... (counter: ${currentCounter})`);
    return result;
  }

  /**
   * Применяет regex паттерн к счетчику
   * Пример: pattern = "985[1-9]{12}", counter = 1 -> "985100000000001"
   */
  private applyPattern(pattern: string, counter: number): string {
    this.logger.debug(`applyPattern called with: "${pattern}" and counter: ${counter}`);
    
    try {
      // Очищаем паттерн от переносов строк и лишних пробелов
      const cleanPattern = pattern.replace(/[\r\n]+/g, '').trim();
      this.logger.debug(`Cleaned pattern: "${cleanPattern}"`);
      
      // Для паттерна "985[1-9]{12}" нужна специальная обработка
      if (cleanPattern === '985[1-9]{12}') {
        // Берем счетчик, дополняем до 12 цифр и добавляем префикс 985
        const counterStr = counter.toString().padStart(12, '0');
        const result = '985' + counterStr;
        this.logger.debug(`Special case result: "${result}"`);
        return result;
      }

      let result = cleanPattern;
      
      // Заменяем [1-9] на первую цифру счетчика (1-9)
      const digitMatches = cleanPattern.match(/\[1-9\]/g);
      if (digitMatches && digitMatches.length > 0) {
        // Используем первую цифру счетчика (если она 0, заменяем на 1)
        const firstDigit = counter.toString().charAt(0);
        const replacementDigit = firstDigit === '0' ? '1' : firstDigit;
        result = result.replace(/\[1-9\]/, replacementDigit);
      }

      // Находим все {n} паттерны и заменяем на соответствующие цифры
      const lengthMatches = result.match(/\{(\d+)\}/g);
      if (lengthMatches) {
        let counterStr = counter.toString().padStart(12, '0'); // Дополняем до 12 цифр
        let startIndex = 0;

        for (const match of lengthMatches) {
          const length = parseInt(match.slice(1, -1)); // Извлекаем число из {n}
          
          // Берем цифры из счетчика, начиная с правильного индекса
          let digits = counterStr.substring(startIndex, startIndex + length);
          
          // Если цифр не хватает, дополняем нулями слева
          if (digits.length < length) {
            digits = digits.padStart(length, '0');
          }
          
          result = result.replace(match, digits);
          startIndex += length;
        }
      }

      // Если в паттерне нет явных указаний длины, просто добавляем счетчик
      if (!pattern.includes('{') && !pattern.includes('[')) {
        result = pattern + counter.toString();
      }

      return result;
    } catch (error) {
      this.logger.error(`Error applying pattern ${pattern} to counter ${counter}: ${error}`);
      // В случае ошибки возвращаем базовый вариант
      return pattern + counter.toString();
    }
  }

  /**
   * Сбрасывает счетчик для конкретного ключа
   */
  resetCounter(counterKey: string): void {
    this.counters.delete(counterKey);
    this.logger.debug(`Reset counter for key: ${counterKey}`);
  }

  /**
   * Получает текущее значение счетчика
   */
  getCurrentCounter(counterKey: string): number {
    return this.counters.get(counterKey) || 0;
  }

  /**
   * Устанавливает начальное значение счетчика
   */
  setInitialCounter(counterKey: string, value: number): void {
    this.counters.set(counterKey, value);
    this.logger.debug(`Set initial counter for key ${counterKey}: ${value}`);
  }

  /**
   * Очищает все счетчики
   */
  clearAllCounters(): void {
    this.counters.clear();
    this.logger.debug('All counters cleared');
  }
}
