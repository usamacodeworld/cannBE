"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const typeorm_1 = require("typeorm");
class CategoryService {
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    transformToResponseDto(category) {
        return {
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description || "",
            image: category.image || "",
            isActive: category.isActive || false,
            isDeleted: category.isDeleted || false,
            isFeatured: category.isFeatured || false,
            isPopular: category.isPopular || false,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
        };
    }
    slugify(text) {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-") // Replace spaces with -
            .replace(/[^\w\-]+/g, "") // Remove all non-word chars
            .replace(/\-\-+/g, "-") // Replace multiple - with single -
            .replace(/^-+/, "") // Trim - from start of text
            .replace(/-+$/, ""); // Trim - from end of text
    }
    async generateUniqueSlug(name) {
        let slug = this.slugify(name);
        let counter = 1;
        let uniqueSlug = slug;
        while (await this.categoryRepository.findOne({ where: { slug: uniqueSlug } })) {
            uniqueSlug = `${slug}-${counter}`;
            counter++;
        }
        return uniqueSlug;
    }
    async create(createCategoryDto) {
        const slug = await this.generateUniqueSlug(createCategoryDto.name);
        const category = this.categoryRepository.create({
            ...createCategoryDto,
            slug,
            isParent: createCategoryDto.parentId ? true : createCategoryDto.isParent,
        });
        const savedCategory = await this.categoryRepository.save(category);
        return this.transformToResponseDto(savedCategory);
    }
    async findAll(query) {
        const { page = 1, limit = 10, sort = "updatedAt", order = "desc", filters = {}, } = query;
        const skip = (page - 1) * limit;
        const { search, parentId, isActive, isFeatured, isPopular } = filters;
        // Build where conditions
        const baseConditions = {
            isDeleted: false,
        };
        if (parentId)
            baseConditions.parentId = parentId;
        if (isActive !== undefined)
            baseConditions.isActive = isActive;
        if (isFeatured !== undefined)
            baseConditions.isFeatured = isFeatured;
        if (isPopular !== undefined)
            baseConditions.isPopular = isPopular;
        let where = baseConditions;
        if (search) {
            where = [
                { ...baseConditions, name: (0, typeorm_1.Like)(`%${search}%`) },
                { ...baseConditions, slug: (0, typeorm_1.Like)(`%${search}%`) },
                { ...baseConditions, description: (0, typeorm_1.Like)(`%${search}%`) },
            ];
        }
        // Get total count
        const [categories, total] = await this.categoryRepository.findAndCount({
            where,
            skip,
            take: limit,
            order: {
                [sort]: order,
            },
        });
        // Transform categories to response DTO
        const categoryDtos = categories.map((category) => this.transformToResponseDto(category));
        return {
            data: categoryDtos,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const category = await this.categoryRepository.findOne({
            where: { id, isDeleted: false },
        });
        if (!category) {
            throw new Error(`Category with ID ${id} not found`);
        }
        return this.transformToResponseDto(category);
    }
    async update(id, updateCategoryDto) {
        const category = await this.findOne(id);
        // If name is being updated, generate new slug
        if (updateCategoryDto.name) {
            updateCategoryDto.slug = await this.generateUniqueSlug(updateCategoryDto.name);
        }
        Object.assign(category, updateCategoryDto);
        const updatedCategory = await this.categoryRepository.save(category);
        return this.transformToResponseDto(updatedCategory);
    }
    async remove(id) {
        const category = await this.categoryRepository.findOne({
            where: { id, isDeleted: false },
        });
        if (!category) {
            throw new Error(`Category with ID ${id} not found`);
        }
        await this.categoryRepository.remove(category);
    }
    async findSubCategories(parentId, query) {
        const { page = 1, limit = 10, filters = {}, sort = "createdAt", order = "desc", } = query;
        const { search, isActive, isFeatured, isPopular } = filters;
        const skip = (page - 1) * limit;
        // Build where conditions
        const whereConditions = {
            parentId: parentId,
            isDeleted: false,
        };
        if (search) {
            whereConditions.where = [
                { name: (0, typeorm_1.Like)(`%${search}%`) },
                { slug: (0, typeorm_1.Like)(`%${search}%`) },
                { description: (0, typeorm_1.Like)(`%${search}%`) },
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
                [sort]: order,
            },
        });
        // Transform categories to response DTO
        const categoryDtos = categories.map((category) => this.transformToResponseDto(category));
        return {
            data: categoryDtos,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findParentCategories(query) {
        const { page = 1, limit = 10, filters = {}, sort = "createdAt", order = "desc", } = query;
        const skip = (page - 1) * limit;
        const { search, parentId, isActive, isFeatured, isPopular } = filters;
        // Build where conditions
        const whereConditions = {
            isParent: true,
            isDeleted: false,
        };
        if (search) {
            whereConditions.where = [
                { name: (0, typeorm_1.Like)(`%${search}%`) },
                { slug: (0, typeorm_1.Like)(`%${search}%`) },
                { description: (0, typeorm_1.Like)(`%${search}%`) },
            ];
        }
        if (isActive) {
            whereConditions.isActive = isActive;
        }
        if (parentId) {
            whereConditions.parentId = parentId;
        }
        if (isFeatured) {
            whereConditions.isFeatured = isFeatured;
        }
        if (isPopular) {
            whereConditions.isPopular = isPopular;
        }
        // Get total count
        const [categories, total] = await this.categoryRepository.findAndCount({
            where: whereConditions,
            skip,
            take: limit,
            order: {
                [sort]: order,
            },
        });
        // Transform categories to response DTO
        const categoryDtos = categories.map((category) => this.transformToResponseDto(category));
        return {
            data: categoryDtos,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}
exports.CategoryService = CategoryService;
