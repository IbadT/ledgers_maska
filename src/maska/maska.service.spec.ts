import { Test, TestingModule } from '@nestjs/testing';
import { MaskaService } from './maska.service';

describe('MaskaService', () => {
  let service: MaskaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MaskaService],
    }).compile();

    service = module.get<MaskaService>(MaskaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
