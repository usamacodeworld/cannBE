import { IsString, IsOptional } from 'class-validator';

export class UpdateAttributeDto {
  @IsString()
  @IsOptional()
  name?: string;
} 