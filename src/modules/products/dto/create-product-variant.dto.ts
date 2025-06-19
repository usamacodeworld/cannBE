import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateProductVariantDto {
  @IsString()
  variant: string;

  @IsString()
  sku: string;

  @IsNumber()
  price: number;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  image?: string;
} 