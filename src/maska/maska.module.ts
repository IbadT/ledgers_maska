import { Module } from '@nestjs/common';
import { MaskaService } from './maska.service';
import { MaskaController } from './maska.controller';
import { GeneratorsService } from 'src/generators/generators.service';
import { ContractorsService } from 'src/contractors/contractors.service';
import { TemplatesService } from 'src/templates/templates.service';

@Module({
  controllers: [MaskaController],
  providers: [MaskaService, GeneratorsService, ContractorsService, TemplatesService],
})
export class MaskaModule {}
