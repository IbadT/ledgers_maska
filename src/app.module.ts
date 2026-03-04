import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MaskaModule } from './maska/maska.module';
import { TemplatesModule } from './templates/templates.module';
import { ContractorsModule } from './contractors/contractors.module';
import { GeneratorsModule } from './generators/generators.module';

@Module({
  imports: [MaskaModule, TemplatesModule, ContractorsModule, GeneratorsModule],
  controllers: [AppController],
})
export class AppModule {}
