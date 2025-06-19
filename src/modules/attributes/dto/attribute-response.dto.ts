import { BaseDto } from '../../../common/dto/base.dto';

export class AttributeResponseDto implements BaseDto {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
} 