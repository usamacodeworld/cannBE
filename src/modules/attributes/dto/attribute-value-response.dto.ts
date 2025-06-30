import { BaseDto } from '../../../common/dto/base.dto';

export class AttributeValueResponseDto implements BaseDto {
  id: string;
  variant?: string;
  sku?: string;
  price?: number;
  quantity?: number;
  imageId?: string;
  attributeId: string;
  createdAt: Date;
  updatedAt: Date;
} 