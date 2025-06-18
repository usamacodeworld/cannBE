import { IsString, IsOptional } from 'class-validator';

export class UpdateAttributeValueDto {
  @IsString()
  @IsOptional()
  value?: string;

  @IsString()
  @IsOptional()
  colorCode?: string;
} 