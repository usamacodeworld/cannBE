import { IsArray, IsString, IsBoolean, IsOptional, IsUUID, ArrayNotEmpty, ArrayUnique } from 'class-validator';

export class CreateCategoryRestrictionDto {
  @IsUUID()
  categoryId: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  states: string[]; // Array of 2-character state codes

  @IsOptional()
  @IsBoolean()
  isRestricted?: boolean = true;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  customMessage?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @IsOptional()
  @IsUUID()
  createdBy?: string;

  @IsOptional()
  @IsString()
  notes?: string;
} 