import { Module } from '@nestjs/common';
import { ContractorsService } from './contractors.service';

@Module({
  providers: [ContractorsService],
})
export class ContractorsModule {}
