import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateProductVariantDto {
  @IsOptional()
  @IsString()
  variant?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  quantity?: number;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  imageBase64?: string;
} 