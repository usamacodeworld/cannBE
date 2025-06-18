export class ProductVariantResponseDto {
  id: string;
  product_id: string;
  variant: string;
  sku: string;
  price: number;
  quantity: number;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
} 