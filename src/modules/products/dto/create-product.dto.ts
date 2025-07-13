import { IsString, IsOptional, IsArray, IsBoolean, IsNumber, IsDate, IsUUID } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;

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
  categoryIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
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
  photosIds?: string[];

  @IsOptional()
  @IsUUID()
  thumbnailImgId?: string;

  @IsOptional()
  @IsString()
  thumbnailBase64?: string;

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
  photosBase64?: string[];

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
  tags?: string[];

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  longDescription?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  regularPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  salePrice?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true' || value === '1';
    }
    return value;
  })
  isVariant?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true' || value === '1';
    }
    return value;
  })
  published?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true' || value === '1';
    }
    return value;
  })
  approved?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  stock?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true' || value === '1';
    }
    return value;
  })
  cashOnDelivery?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true' || value === '1';
    }
    return value;
  })
  featured?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  discount?: number;

  @IsOptional()
  @IsString()
  discountType?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  discountStartDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  discountEndDate?: Date;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  tax?: number;

  @IsOptional()
  @IsString()
  taxType?: string;

  @IsOptional()
  @IsString()
  shippingType?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  shippingCost?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  estShippingDays?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  numOfSales?: number;

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  rating?: number;

  @IsOptional()
  @IsString()
  externalLink?: string;

  @IsOptional()
  @IsString()
  externalLinkBtn?: string;

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
        if (typeof parsed === 'object') return [parsed];
        return [];
      } catch {
        return [];
      }
    }
    if (Array.isArray(value)) return value;
    if (typeof value === 'object') return [value];
    return [];
  })
  variations?: Array<{
    name: string;
    variant: string;
    sku: string;
    price: number;
    quantity: number;
    imageId?: string;
  }>;

  @IsOptional()
  @IsUUID()
  sellerId?: string;
} 