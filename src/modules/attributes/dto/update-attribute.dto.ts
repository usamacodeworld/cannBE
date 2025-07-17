import { IsString, IsOptional, IsUUID } from 'class-validator';

export class UpdateAttributeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsUUID()
  @IsOptional()
  productId?: string;
} 