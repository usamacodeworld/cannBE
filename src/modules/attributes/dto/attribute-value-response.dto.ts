import { BaseDto } from '../../../common/dto/base.dto';

export class AttributeValueResponseDto implements BaseDto {
  id: string;
  value: string;
  colorCode?: string;
  attributeId: string;
  createdAt: Date;
  updatedAt: Date;
} 