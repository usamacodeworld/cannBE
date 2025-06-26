import { BaseDto } from '../../../common/dto/base.dto';
import { Category } from '../category.entity';
import { MediaFile } from '../../media/entities/media-file.entity';

export class CategoryResponseDto implements BaseDto {
    id: string;
    name: string;
    slug: string;
    description: string;
    mediaFiles: MediaFile[];
    mediaFile?: MediaFile;
    isActive: boolean;
    isDeleted: boolean;
    isFeatured: boolean;
    isPopular: boolean;
    createdAt: Date;
    updatedAt: Date;
    parent?: Category;
    parentId?: string;
} 