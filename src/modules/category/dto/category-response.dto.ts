import { BaseDto } from '../../../common/dto/base.dto';

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

} 