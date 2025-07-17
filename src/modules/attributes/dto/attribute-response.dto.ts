import { BaseDto } from '../../../common/dto/base.dto';

export class AttributeResponseDto implements BaseDto {
  id: string;
  name: string;
  productId?: string;
  createdAt: Date;
  updatedAt: Date;
} 