import { IsString, IsOptional, IsArray, IsBoolean, IsNumber, IsDate, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProductVariantDto } from './create-product-variant.dto';

export class CreateProductDto {
  @IsOptional()
  @IsString()
  added_by?: string;

  @IsOptional()
  @IsString()
  user_id?: string;

  @IsOptional()
  @IsString()
  category_id?: string;

  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsArray()
  @IsString({ each: true })
  photos: string[];

  @IsOptional()
  @IsString()
  thumbnail_img?: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsOptional()
  @IsString()
  short_description?: string;

  @IsOptional()
  @IsString()
  long_description?: string;

  @IsOptional()
  @IsNumber()
  regular_price?: number;

  @IsOptional()
  @IsNumber()
  sale_price?: number;

  @IsOptional()
  @IsBoolean()
  is_variant?: boolean;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsBoolean()
  approved?: boolean;

  @IsOptional()
  @IsNumber()
  stock?: number;

  @IsOptional()
  @IsBoolean()
  cash_on_delivery?: boolean;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsNumber()
  discount?: number;

  @IsOptional()
  @IsString()
  discount_type?: string;

  @IsOptional()
  @IsDate()
  discount_start_date?: Date;

  @IsOptional()
  @IsDate()
  discount_end_date?: Date;

  @IsOptional()
  @IsNumber()
  tax?: number;

  @IsOptional()
  @IsString()
  tax_type?: string;

  @IsOptional()
  @IsString()
  shipping_type?: string;

  @IsOptional()
  @IsNumber()
  shipping_cose?: number;

  @IsOptional()
  @IsNumber()
  est_shipping_days?: number;

  @IsOptional()
  @IsNumber()
  num_of_sales?: number;

  @IsOptional()
  @IsString()
  meta_title?: string;

  @IsOptional()
  @IsString()
  meta_description?: string;

  @IsOptional()
  @IsNumber()
  rating?: number;

  @IsOptional()
  @IsString()
  external_link?: string;

  @IsOptional()
  @IsString()
  external_link_btn?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variations?: CreateProductVariantDto[];
} 