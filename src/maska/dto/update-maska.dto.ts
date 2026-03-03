import { PartialType } from '@nestjs/mapped-types';
import { CreateMaskaDto } from './create-maska.dto';

export class UpdateMaskaDto extends PartialType(CreateMaskaDto) {
  id: number;
}
