import { Test, TestingModule } from '@nestjs/testing';
import { TemplatesService } from './templates.service';
import { MaskPatternParserService } from './mask-pattern-parser.service';
import { CaseFormatterService } from './case-formatter.service';
import { SequentialGeneratorService } from '../generators/sequential-generator.service';
import { TemplateData } from '../maska/interfaces/template-data.interface';
import { PlaceholderSource, PlaceholderFormatter } from './interfaces/template.interface';

describe('TemplatesService', () => {
  let service: TemplatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplatesService,
        MaskPatternParserService,
        CaseFormatterService,
        SequentialGeneratorService,
      ],
    }).compile();

    service = module.get<TemplatesService>(TemplatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Mask Syntax Rendering', () => {
    const mockData: TemplateData = {
      companyInfo: {
        companyName: 'Srb Autos LLC',
        ownerName: 'John Smith',
        state: 'CA',
        accountNumber: '2910',
      },
      date: '2026-03-02',
      cardLast4: '2910',
      pmtId: '123456789',
      coId: '987654321',
      confirm: '123456',
      merchantName: 'EXXONMOBIL',
      stateCode: 'CA',
    };

    it('should render &NUMUP pattern correctly', () => {
      const templateString = 'PAYCHEX DES:PAYROLL ID:&NUMUP{985[1-9]{12}} INDN:TEST';
      const template = {
        type: 'TEST',
        category: 'test',
        method: 'ACH',
        templateString,
        placeholders: [],
      };

      const result = service.render(template, mockData);
      expect(result).toContain('PAYCHEX DES:PAYROLL ID:985');
      expect(result).toContain('INDN:TEST');
    });

    it('should render &PERNAM in different cases correctly', () => {
      const testCases = [
        {
          template: 'TEST &PERNAM',
          expectedContains: 'SRB AUTOS LLC',
        },
        {
          template: 'TEST &PerNam',
          expectedContains: 'Srb Autos Llc',
        },
        {
          template: 'TEST &pernam',
          expectedContains: 'srb autos llc',
        },
        {
          template: 'TEST &PERNAMasis',
          expectedContains: 'Srb Autos LLC',
        },
      ];

      testCases.forEach(({ template, expectedContains }) => {
        const templateObj = {
          type: 'TEST',
          category: 'test',
          method: 'ACH',
          templateString: template,
          placeholders: [],
        };

        const result = service.render(templateObj, mockData);
        expect(result).toContain(expectedContains);
      });
    });

    it('should render &DAT with different formats', () => {
      const templateString = 'DATE: &DAT{YYYY-MM-DD}';
      const template = {
        type: 'TEST',
        category: 'test',
        method: 'ACH',
        templateString,
        placeholders: [],
      };

      const result = service.render(template, mockData);
      expect(result).toContain('DATE: 2026-03-02');
    });

    it('should render &MERCHTNAME and &MERCHADDYSTATECODE', () => {
      const templateString = 'CHECKCARD &DAT{YYYY-MM-DD} &MERCHTNAME &MERCHADDYSTATECODE';
      const template = {
        type: 'TEST',
        category: 'test',
        method: 'ACH',
        templateString,
        placeholders: [],
      };

      const result = service.render(template, mockData);
      expect(result).toContain('CHECKCARD 2026-03-02 EXXONMOBIL CA');
    });

    it('should render &ATTCHCARDLAST4', () => {
      const templateString = 'CARD XXXXXXXXXXXX&ATTCHCARDLAST4';
      const template = {
        type: 'TEST',
        category: 'test',
        method: 'ACH',
        templateString,
        placeholders: [],
      };

      const result = service.render(template, mockData);
      expect(result).toContain('CARD XXXXXXXXXXXX2910');
    });
  });

  describe('Backward Compatibility', () => {
    it('should still render legacy {placeholder} syntax', () => {
      const template = {
        type: 'TEST',
        category: 'test',
        method: 'ACH',
        templateString: '{COMPANY_NAME} ID:{PMT_ID}',
        placeholders: [
          {
            name: 'COMPANY_NAME',
            source: PlaceholderSource.COMPANY_INFO,
            field: 'companyName',
            required: true,
            formatter: PlaceholderFormatter.UPPERCASE,
          },
          {
            name: 'PMT_ID',
            source: PlaceholderSource.GENERATED,
            required: true,
            length: 9,
          },
        ],
      };

      const mockData: TemplateData = {
        companyInfo: {
          companyName: 'Test Company',
          ownerName: 'Test Owner',
          state: 'CA',
        },
        date: '2026-03-02',
        cardLast4: '2910',
        pmtId: '123456789',
        coId: '987654321',
        confirm: '123456',
      };

      const result = service.render(template, mockData);
      expect(result).toContain('TEST COMPANY ID:123456789');
    });
  });
});
