import { IsString, IsOptional, IsBoolean, IsUUID } from "class-validator";

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isParent?: boolean;

  @IsUUID()
  @IsOptional()
  parentId?: string;

  @IsUUID()
  @IsOptional()
  thumbnailImageId?: string;

  @IsUUID()
  @IsOptional()
  coverImageId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsBoolean()
  @IsOptional()
  isPopular?: boolean;
}
