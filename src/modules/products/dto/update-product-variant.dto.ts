import { IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateProductVariantDto {
  @IsOptional()
  @IsString()
  variant?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  imageBase64?: string;
} 