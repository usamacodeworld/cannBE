import { IsString, IsNotEmpty, IsOptional, IsNumber, IsUUID } from 'class-validator';

export class CreateAttributeValueDto {


  @IsString()
  @IsOptional()
  variant?: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  quantity?: number;

  @IsUUID()
  @IsOptional()
  imageId?: string;
} 