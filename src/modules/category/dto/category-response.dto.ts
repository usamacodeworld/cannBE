import { BaseDto } from '../../../common/dto/base.dto';
import { Category } from '../category.entity';

export class CategoryResponseDto implements BaseDto {
    id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    isActive: boolean;
    isDeleted: boolean;
    isFeatured: boolean;
    isPopular: boolean;
    createdAt: Date;
    updatedAt: Date;
    parent?: Category;
    parentId?:string
} 