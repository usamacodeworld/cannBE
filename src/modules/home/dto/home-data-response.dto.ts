import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';

export class ProductSummaryDto {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  regularPrice: number;
  salePrice: number;
  discount: number;
  discountType: string;
  rating: number;
  numOfSales: number;
  stock: number;
  thumbnailImgId: string;
  thumbnailImg?: {
    id: string;
    scope: string;
    uri: string;
    url: string;
    fileName: string;
    mimetype: string;
    size: number;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export class CategorySummaryDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  parentId: string | null;
  thumbnailImageId: string | null;
  thumbnailImage?: {
    id: string;
    scope: string;
    uri: string;
    url: string;
    fileName: string;
    mimetype: string;
    size: number;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export class DealProductDto extends ProductSummaryDto {
  discountStartDate: Date;
  discountEndDate: Date;
}

export class HomeDataMetaDto {
  featuredProductsCount: number;
  newArrivalsCount: number;
  popularCategoriesCount: number;
  trendingProductsCount: number;
  dealsCount: number;
}

export class HomeDataResponseDto {
  featuredProducts: ProductSummaryDto[];
  newArrivals: ProductSummaryDto[];
  popularCategories: CategorySummaryDto[];
  trendingProducts: ProductSummaryDto[];
  deals: DealProductDto[];
  meta: HomeDataMetaDto;
} 