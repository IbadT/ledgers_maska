import { Injectable } from '@nestjs/common';
import { CreateGeneratorDto } from './dto/create-generator.dto';
import { UpdateGeneratorDto } from './dto/update-generator.dto';

@Injectable()
export class GeneratorsService {
  create(createGeneratorDto: CreateGeneratorDto) {
    return 'This action adds a new generator';
  }

  findAll() {
    return `This action returns all generators`;
  }

  findOne(id: number) {
    return `This action returns a #${id} generator`;
  }

  update(id: number, updateGeneratorDto: UpdateGeneratorDto) {
    return `This action updates a #${id} generator`;
  }

  remove(id: number) {
    return `This action removes a #${id} generator`;
  }
}
