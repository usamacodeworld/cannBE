import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class GetHomeDataQueryDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(20)
  featuredProductsLimit?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(20)
  newArrivalsLimit?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(20)
  popularCategoriesLimit?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(20)
  trendingProductsLimit?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(20)
  dealsLimit?: number;

  // For paginated endpoints
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(50)
  limit?: number;
} 