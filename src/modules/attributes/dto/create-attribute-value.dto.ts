import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAttributeValueDto {
  @IsString()
  @IsNotEmpty()
  value: string;

  @IsString()
  @IsOptional()
  colorCode?: string;
} 