import { Module } from '@nestjs/common';
import { GeneratorsService } from './generators.service';

@Module({
  providers: [GeneratorsService],
})
export class GeneratorsModule {}
