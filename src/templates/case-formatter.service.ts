import { Injectable, Logger } from '@nestjs/common';
import { PlaceholderFormatter } from './interfaces/template.interface';

@Injectable()
export class CaseFormatterService {
  private readonly logger = new Logger(CaseFormatterService.name);

  /**
   * Применяет форматирование регистра к строке
   */
  formatCase(value: string, format: PlaceholderFormatter | 'auto' | 'upper' | 'lower' | 'title' | 'asis', originalPlaceholderName?: string): string {
    if (!value) return value;

    this.logger.debug(`Formatting case for "${value}" with format: ${format}`);

    switch (format) {
      case PlaceholderFormatter.UPPERCASE:
      case 'upper':
        return value.toUpperCase();

      case PlaceholderFormatter.LOWERCASE:
      case 'lower':
        return value.toLowerCase();

      case PlaceholderFormatter.TITLE_CASE:
      case 'title':
        return this.toTitleCase(value);

      case PlaceholderFormatter.AS_IS:
      case 'asis':
        return value;

      case PlaceholderFormatter.AUTO_CASE:
      case 'auto':
        if (!originalPlaceholderName) {
          this.logger.warn('Auto case format requested but no original placeholder name provided');
          return value.toUpperCase(); // Дефолт
        }
        return this.formatByPlaceholderName(value, originalPlaceholderName);

      default:
        return value;
    }
  }

  /**
   * Форматирует строку в Title Case (каждое слово с заглавной буквы)
   */
  private toTitleCase(str: string): string {
    return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
  }

  /**
   * Определяет форматирование по имени плейсхолдера
   */
  private formatByPlaceholderName(value: string, placeholderName: string): string {
    if (placeholderName === placeholderName.toUpperCase()) {
      // PERNAM -> SRB AUTOS LLC
      return value.toUpperCase();
    } else if (placeholderName === placeholderName.toLowerCase()) {
      // pernam -> srb autos llc
      return value.toLowerCase();
    } else if (this.isTitleCase(placeholderName)) {
      // PerNam -> Srb Autos Llc
      return this.toTitleCase(value);
    } else {
      // PERNAMasis или любой другой смешанный регистр
      return value; // Как есть
    }
  }

  /**
   * Проверяет, является ли строка в Title Case
   */
  private isTitleCase(str: string): boolean {
    // Простая проверка: первая буква заглавная, остальные могут быть строчными
    if (str.length === 0) return false;
    
    const firstChar = str.charAt(0);
    const restChars = str.substring(1);
    
    return firstChar === firstChar.toUpperCase() && 
           restChars === restChars.toLowerCase();
  }

  /**
   * Определяет формат регистра по имени плейсхолдера (для автоопределения)
   */
  determineCaseFormat(placeholderName: string): 'auto' | 'upper' | 'lower' | 'title' | 'asis' {
    if (placeholderName === placeholderName.toUpperCase()) {
      return 'upper';
    } else if (placeholderName === placeholderName.toLowerCase()) {
      return 'lower';
    } else if (this.isTitleCase(placeholderName)) {
      return 'title';
    } else {
      return 'asis';
    }
  }

  /**
   * Применяет множественные форматеры (если нужно)
   */
  applyMultipleFormatters(value: string, formatters: PlaceholderFormatter[]): string {
    let result = value;
    
    for (const formatter of formatters) {
      result = this.formatCase(result, formatter);
    }
    
    return result;
  }

  /**
   * Форматирует дату в соответствии с указанным форматом
   */
  formatDate(dateStr: string, format: string): string {
    const date = new Date(dateStr);
    
    if (isNaN(date.getTime())) {
      this.logger.warn(`Invalid date string: ${dateStr}`);
      return dateStr;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    switch (format) {
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'MMDD':
        return `${month}${day}`;
      case 'MM/DD':
        return `${month}/${day}`;
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      default:
        this.logger.warn(`Unknown date format: ${format}, using default`);
        return dateStr;
    }
  }
}
