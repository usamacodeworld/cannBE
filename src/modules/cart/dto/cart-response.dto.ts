import { ProductResponseDto } from '../../products/dto/product-response.dto';

export class CartVariantResponseDto {
  attributeId: string;
  attributeValueId: string;
  attributeName: string;
  attributeValue: string;
}

export class CartResponseDto {
  id: string;
  guestId?: string;
  userId?: string;
  productId: string;
  quantity: number;
  price?: number;
  variants?: CartVariantResponseDto[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  product?: ProductResponseDto;
} 