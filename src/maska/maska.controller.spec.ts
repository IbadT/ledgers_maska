import { Test, TestingModule } from '@nestjs/testing';
import { MaskaController } from './maska.controller';
import { MaskaService } from './maska.service';

describe('MaskaController', () => {
  let controller: MaskaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaskaController],
      providers: [MaskaService],
    }).compile();

    controller = module.get<MaskaController>(MaskaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
