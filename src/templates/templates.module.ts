import { Module } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { MaskPatternParserService } from './mask-pattern-parser.service';
import { CaseFormatterService } from './case-formatter.service';
import { SequentialGeneratorService } from '../generators/sequential-generator.service';

@Module({
  providers: [
    TemplatesService,
    MaskPatternParserService,
    CaseFormatterService,
    SequentialGeneratorService,
  ],
  exports: [
    TemplatesService,
    MaskPatternParserService,
    CaseFormatterService,
    SequentialGeneratorService,
  ],
})
export class TemplatesModule {}
