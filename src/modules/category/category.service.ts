import { Repository, Like } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { GetCategoriesQueryDto } from './dto/get-categories-query.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

export class CategoryService {
    private categoryRepository: Repository<Category>;

    constructor(categoryRepository: Repository<Category>) {
        this.categoryRepository = categoryRepository;
    }

    private transformToResponseDto(category: Category): CategoryResponseDto {
        return {
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description || '',
            image: category.image || '',
            isActive: category.isActive || false,
            isDeleted: category.isDeleted || false,
            isFeatured: category.isFeatured || false,
            isPopular: category.isPopular || false,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt
        };
    }

    private slugify(text: string): string {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')        // Replace spaces with -
            .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
            .replace(/\-\-+/g, '-')      // Replace multiple - with single -
            .replace(/^-+/, '')          // Trim - from start of text
            .replace(/-+$/, '');         // Trim - from end of text
    }

    private async generateUniqueSlug(name: string): Promise<string> {
        let slug = this.slugify(name);
        let counter = 1;
        let uniqueSlug = slug;

        while (await this.categoryRepository.findOne({ where: { slug: uniqueSlug } })) {
            uniqueSlug = `${slug}-${counter}`;
            counter++;
        }

        return uniqueSlug;
    }

    async create(createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
        const slug = await this.generateUniqueSlug(createCategoryDto.name);
        const category = this.categoryRepository.create({
            ...createCategoryDto,
            slug,
            isParent: createCategoryDto.parent_id ? true : createCategoryDto.isParent
        });
        const savedCategory = await this.categoryRepository.save(category);
        return this.transformToResponseDto(savedCategory);
    }

    async findAll(query: GetCategoriesQueryDto): Promise<PaginatedResponseDto<CategoryResponseDto>> {
        const { page = 1, limit = 10, search, isActive, isFeatured, isPopular, sort = 'createdAt', order = 'desc' } = query;
        const skip = (page - 1) * limit;

        // Build where conditions
        const whereConditions: any = { isDeleted: false };

        if (search) {
            whereConditions.where = [
                { name: Like(`%${search}%`) },
                { slug: Like(`%${search}%`) },
                { description: Like(`%${search}%`) }
            ];
        }

        if (isActive !== undefined) {
            whereConditions.isActive = isActive;
        }

        if (isFeatured !== undefined) {
            whereConditions.isFeatured = isFeatured;
        }

        if (isPopular !== undefined) {
            whereConditions.isPopular = isPopular;
        }

        // Get total count
        const [categories, total] = await this.categoryRepository.findAndCount({
            where: whereConditions,
            skip,
            take: limit,
            order: {
                [sort]: order
            }
        });

        // Transform categories to response DTO
        const categoryDtos = categories.map(category => this.transformToResponseDto(category));

        return {
            data: categoryDtos,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async findOne(id: string): Promise<CategoryResponseDto> {
        const category = await this.categoryRepository.findOne({
            where: { id, isDeleted: false }
        });
        if (!category) {
            throw new Error(`Category with ID ${id} not found`);
        }
        return this.transformToResponseDto(category);
    }

    async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryResponseDto> {
        const category = await this.findOne(id);
        
        // If name is being updated, generate new slug
        if (updateCategoryDto.name) {
            updateCategoryDto.slug = await this.generateUniqueSlug(updateCategoryDto.name);
        }
        
        Object.assign(category, updateCategoryDto);
        const updatedCategory = await this.categoryRepository.save(category);
        return this.transformToResponseDto(updatedCategory);
    }

    async remove(id: string): Promise<void> {
        const category = await this.categoryRepository.findOne({
            where: { id, isDeleted: false }
        });
        if (!category) {
            throw new Error(`Category with ID ${id} not found`);
        }
        await this.categoryRepository.remove(category);
    }

    async findSubCategories(parentId: string, query: GetCategoriesQueryDto): Promise<PaginatedResponseDto<CategoryResponseDto>> {
        const { page = 1, limit = 10, search, isActive, isFeatured, isPopular, sort = 'createdAt', order = 'desc' } = query;
        const skip = (page - 1) * limit;

        // Build where conditions
        const whereConditions: any = { 
            parent_id: parentId, 
            isDeleted: false 
        };

        if (search) {
            whereConditions.where = [
                { name: Like(`%${search}%`) },
                { slug: Like(`%${search}%`) },
                { description: Like(`%${search}%`) }
            ];
        }

        if (isActive !== undefined) {
            whereConditions.isActive = isActive;
        }

        if (isFeatured !== undefined) {
            whereConditions.isFeatured = isFeatured;
        }

        if (isPopular !== undefined) {
            whereConditions.isPopular = isPopular;
        }

        // Get total count
        const [categories, total] = await this.categoryRepository.findAndCount({
            where: whereConditions,
            skip,
            take: limit,
            order: {
                [sort]: order
            }
        });

        // Transform categories to response DTO
        const categoryDtos = categories.map(category => this.transformToResponseDto(category));

        return {
            data: categoryDtos,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async findParentCategories(query: GetCategoriesQueryDto): Promise<PaginatedResponseDto<CategoryResponseDto>> {
        const { page = 1, limit = 10, search, isActive, isFeatured, isPopular, sort = 'createdAt', order = 'desc' } = query;
        const skip = (page - 1) * limit;

        // Build where conditions
        const whereConditions: any = { 
            isParent: true, 
            isDeleted: false 
        };

        if (search) {
            whereConditions.where = [
                { name: Like(`%${search}%`) },
                { slug: Like(`%${search}%`) },
                { description: Like(`%${search}%`) }
            ];
        }

        if (isActive !== undefined) {
            whereConditions.isActive = isActive;
        }

        if (isFeatured !== undefined) {
            whereConditions.isFeatured = isFeatured;
        }

        if (isPopular !== undefined) {
            whereConditions.isPopular = isPopular;
        }

        // Get total count
        const [categories, total] = await this.categoryRepository.findAndCount({
            where: whereConditions,
            skip,
            take: limit,
            order: {
                [sort]: order
            }
        });

        // Transform categories to response DTO
        const categoryDtos = categories.map(category => this.transformToResponseDto(category));

        return {
            data: categoryDtos,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
} 