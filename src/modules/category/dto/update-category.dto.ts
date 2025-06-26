import { CreateCategoryDto } from './create-category.dto';
import { IsString, IsOptional, IsBoolean, IsUUID, ValidateIf } from 'class-validator';

export class UpdateCategoryDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    slug?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsUUID()
    @IsOptional()
    mediaFileId?: string;

    @IsBoolean()
    @IsOptional()
    isParent?: boolean;

    @IsUUID()
    @IsOptional()
    parentId?: string;

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