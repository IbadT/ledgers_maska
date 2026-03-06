import { Test, TestingModule } from '@nestjs/testing';
import { MaskaController } from './maska.controller';
import { MaskaService } from './maska.service';
import { GeneratorsService } from '../generators/generators.service';
import { ContractorsService } from '../contractors/contractors.service';
import { TemplatesService } from '../templates/templates.service';

describe('MaskaController', () => {
  let controller: MaskaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaskaController],
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
        {
          provide: 'MATHEMATIKA_SERVICE',
          useValue: {
            emit: jest.fn(),
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MaskaController>(MaskaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
