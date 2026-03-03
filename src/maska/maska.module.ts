import { Module } from '@nestjs/common';
import { MaskaService } from './maska.service';
import { MaskaController } from './maska.controller';

@Module({
  controllers: [MaskaController],
  providers: [MaskaService],
})
export class MaskaModule {}
