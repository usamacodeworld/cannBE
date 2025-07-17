import { MediaFileResponseDto } from '../../media/dto/media-file-response.dto';

export class CategoryInfoDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export class ProductVariationDto {
  attributeId: string;
  attributeValueId: string;
  attributeName: string;
  attributeValue: string;
  sku?: string;
  price?: number;
  quantity?: number;
  imageId?: string;
  image?: MediaFileResponseDto;
}

export class SellerInfoDto {
  id: string;
  businessName: string;
  businessDescription?: string;
  businessEmail?: string;
  businessPhone?: string;
  businessWebsite?: string;
  status: string;
  verificationStatus: string;
  rating: number;
  reviewCount: number;
}

export class ProductResponseDto {
  id: string;
  addedBy: string;
  userId: string;
  sellerId?: string;
  seller?: SellerInfoDto;
  name: string;
  slug: string;
  photosIds: string[];
  photos?: MediaFileResponseDto[];
  thumbnailImgId: string;
  thumbnailImg?: MediaFileResponseDto;
  tags: string[];
  shortDescription: string;
  longDescription: string;
  regularPrice: number;
  salePrice: number;
  isVariant: boolean;
  published: boolean;
  approved: boolean;
  stock: number;
  cashOnDelivery: boolean;
  featured: boolean;
  discount: number;
  discountType: string;
  discountStartDate: Date;
  discountEndDate: Date;
  tax: number;
  taxType: string;
  shippingType: string;
  shippingCost: number;
  estShippingDays: number;
  numOfSales: number;
  metaTitle: string;
  metaDescription: string;
  rating: number;
  externalLink: string;
  externalLinkBtn: string;
  categories: CategoryInfoDto[];
  createdAt: Date;
  updatedAt: Date;
  variations?: ProductVariationDto[];
} 