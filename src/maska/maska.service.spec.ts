import { Test, TestingModule } from '@nestjs/testing';
import { MaskaService } from './maska.service';
import { GeneratorsService } from '../generators/generators.service';
import { ContractorsService } from '../contractors/contractors.service';
import { TemplatesService } from '../templates/templates.service';

describe('MaskaService', () => {
  let service: MaskaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaskaService,
        {
          provide: GeneratorsService,
          useValue: {
            generateRandomData: jest.fn(),
          },
        },
        {
          provide: ContractorsService,
          useValue: {
            getContractorById: jest.fn(),
          },
        },
        {
          provide: TemplatesService,
          useValue: {
            getTemplateByKey: jest.fn(),
            processTemplate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MaskaService>(MaskaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
