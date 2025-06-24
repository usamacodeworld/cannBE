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

    @IsString()
    @IsOptional()
    image?: string; // URL or base64 data

    @IsString()
    @IsOptional()
    @ValidateIf((o) => o.imageBase64 !== undefined)
    imageBase64?: string; // Alternative for base64 image upload

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