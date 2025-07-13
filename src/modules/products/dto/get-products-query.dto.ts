import {
  IsOptional,
  IsString,
  IsBoolean,
  ValidateNested,
  IsNumber,
  IsArray,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

class ProductFilters {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  categoryId?: string; // Keep for backward compatibility

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [value];
      }
    }
    return value;
  })
  categoryIds?: string[]; // New field for multiple categories

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isVariant?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  published?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  featured?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  approved?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxPrice?: number;
}

export class GetProductsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductFilters)
  filters?: ProductFilters;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsString()
  order?: 'asc' | 'desc';
} 