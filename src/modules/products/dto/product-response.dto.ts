import { ProductVariantResponseDto } from './product-variant-response.dto';

export class CategoryInfoDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export class ProductResponseDto {
  id: string;
  addedBy?: string;
  userId?: string;
  categories: CategoryInfoDto[];
  name: string;
  slug: string;
  photos: string[];
  thumbnailImg?: string;
  tags: string[];
  shortDescription?: string;
  longDescription?: string;
  regularPrice?: number;
  salePrice?: number;
  isVariant?: boolean;
  published?: boolean;
  approved?: boolean;
  stock?: number;
  cashOnDelivery?: boolean;
  featured?: boolean;
  discount?: number;
  discountType?: string;
  discountStartDate?: Date;
  discountEndDate?: Date;
  tax?: number;
  taxType?: string;
  shippingType?: string;
  shippingCost?: number;
  estShippingDays?: number;
  numOfSales?: number;
  metaTitle?: string;
  metaDescription?: string;
  rating?: number;
  externalLink?: string;
  externalLinkBtn?: string;
  createdAt: Date;
  updatedAt: Date;
  variants: ProductVariantResponseDto[];
} 