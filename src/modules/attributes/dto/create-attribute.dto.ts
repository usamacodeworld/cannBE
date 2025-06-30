import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateAttributeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  @IsOptional()
  productId?: string;
} 