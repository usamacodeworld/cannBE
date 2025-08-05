import { BaseDto } from '../../../common/dto/base.dto';
import { Category } from '../category.entity';
import { MediaFileResponseDto } from '../../media/dto/media-file-response.dto';

export class CategoryResponseDto implements BaseDto {
    id: string;
    name: string;
    slug: string;
    description: string;
    isActive: boolean;
    isFeatured: boolean;
    isPopular: boolean;
    createdAt: Date;
    updatedAt: Date;
    parent?: Category;
    parentId?: string;
    thumbnailImage?: MediaFileResponseDto;
    coverImage?: MediaFileResponseDto;
    children?: CategoryResponseDto[];
} 