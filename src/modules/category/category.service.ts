import { Repository, Like, FindOptionsWhere } from "typeorm";
import { Category } from "./category.entity";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { CategoryResponseDto } from "./dto/category-response.dto";
import { GetCategoriesQueryDto } from "./dto/get-categories-query.dto";
import { GetCategoriesUnrestrictedQueryDto } from "./dto/get-categories-unrestricted-query.dto";
import { PaginatedResponseDto } from "../../common/dto/paginated-response.dto";
import { MediaFileResponseDto } from "../media/dto/media-file-response.dto";
import { AppDataSource } from "../../config/database";
import { MediaFile } from "../media/media-file.entity";

const mediaRepo = AppDataSource.getRepository(MediaFile);

export class CategoryService {
  private categoryRepository: Repository<Category>;

  constructor(categoryRepository: Repository<Category>) {
    this.categoryRepository = categoryRepository;
  }

  private async transformToResponseDto(
    category: Category
  ): Promise<CategoryResponseDto> {
    const transformMediaFile = (
      mediaFile: any
    ): MediaFileResponseDto | undefined => {
      if (!mediaFile) return undefined;
      return {
        id: mediaFile.id,
        scope: mediaFile.scope,
        uri: mediaFile.uri,
        url: mediaFile.url,
        fileName: mediaFile.fileName,
        mimetype: mediaFile.mimetype,
        size: mediaFile.size,
        userId: mediaFile.userId,
        createdAt: mediaFile.createdAt,
        updatedAt: mediaFile.updatedAt,
      };
    };

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      isActive: category.isActive || false,
      isFeatured: category.isFeatured || false,
      isPopular: category.isPopular || false,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      parent: category.parent,
      parentId: category.parentId,
      thumbnailImage: transformMediaFile(category.thumbnailImage),
      coverImage: transformMediaFile(category.coverImage),
      children: [],
    };
  }

  private slugify(text: string): string {
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

  private async generateUniqueSlug(name: string): Promise<string> {
    let slug = this.slugify(name);
    let counter = 1;
    let uniqueSlug = slug;

    while (
      await this.categoryRepository.findOne({ where: { slug: uniqueSlug } })
    ) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    return uniqueSlug;
  }

  async create(
    createCategoryDto: CreateCategoryDto,
    userId?: string
  ): Promise<CategoryResponseDto> {
    const slug = await this.generateUniqueSlug(
      createCategoryDto.slug || createCategoryDto.name
    );

    const category = this.categoryRepository.create({
      ...createCategoryDto,
      slug,
      isParent: createCategoryDto.parentId ? true : createCategoryDto.isParent,
    });

    const savedCategory = await this.categoryRepository.save(category);

    return this.transformToResponseDto(savedCategory);
  }

  async findAll(
    query: GetCategoriesQueryDto
  ): Promise<PaginatedResponseDto<CategoryResponseDto>> {
    const {
      page = 1,
      limit = 10,
      sort = "updatedAt",
      order = "desc",
      filters = {},
    } = query;
    const skip = (page - 1) * limit;
    const { search, parentId, isActive, isFeatured, isPopular } = filters;

    // Build where conditions
    const baseConditions: FindOptionsWhere<any> = {};

    if (parentId) baseConditions.parentId = parentId;
    if (isActive !== undefined) baseConditions.isActive = isActive;
    if (isFeatured !== undefined) baseConditions.isFeatured = isFeatured;
    if (isPopular !== undefined) baseConditions.isPopular = isPopular;

    let where: FindOptionsWhere<any>[] | FindOptionsWhere<any> = baseConditions;

    if (search) {
      where = [
        { ...baseConditions, name: Like(`%${search}%`) },
        { ...baseConditions, slug: Like(`%${search}%`) },
        { ...baseConditions, description: Like(`%${search}%`) },
      ];
    }

    // Get total count
    const [categories, total] = await this.categoryRepository.findAndCount({
      relations: ["thumbnailImage"],
      where,
      skip,
      take: limit,
      order: {
        [sort]: order,
      },
    });

    // Transform categories to response DTO
    const categoryDtos = await Promise.all(
      categories.map((category) => this.transformToResponseDto(category))
    );

    return {
      data: categoryDtos,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAllWithParents(
    query: GetCategoriesUnrestrictedQueryDto
  ): Promise<CategoryResponseDto[]> {
    const {
      sort = "updatedAt",
      order = "desc",
      filters = {},
    } = query;
    const { search, parentId, isActive, isFeatured, isPopular } = filters;

    // Build where conditions
    const baseConditions: FindOptionsWhere<any> = {};

    if (parentId) baseConditions.parentId = parentId;
    if (isActive !== undefined) baseConditions.isActive = isActive;
    if (isFeatured !== undefined) baseConditions.isFeatured = isFeatured;
    if (isPopular !== undefined) baseConditions.isPopular = isPopular;

    let where: FindOptionsWhere<any>[] | FindOptionsWhere<any> = baseConditions;

    if (search) {
      where = [
        { ...baseConditions, name: Like(`%${search}%`) },
        { ...baseConditions, slug: Like(`%${search}%`) },
        { ...baseConditions, description: Like(`%${search}%`) },
      ];
    }

    // Get all categories with parent relations in single query (no pagination)
    const categories = await this.categoryRepository.find({
      relations: ["parent", "thumbnailImage"],
      where,
      order: {
        [sort]: order,
      },
    });

    // Transform categories to response DTO
    const categoryDtos = await Promise.all(
      categories.map((category) => this.transformToResponseDto(category))
    );

    // Build hierarchical tree structure
    return this.buildCategoryTree(categoryDtos);
  }

  private buildCategoryTree(categories: CategoryResponseDto[]): CategoryResponseDto[] {
    const categoryMap = new Map<string, CategoryResponseDto>();
    const rootCategories: CategoryResponseDto[] = [];

    // First pass: create a map of all categories
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    // Second pass: build the tree structure
    categories.forEach(category => {
      const categoryWithChildren = categoryMap.get(category.id)!;
      
      if (category.parentId && categoryMap.has(category.parentId)) {
        // This is a child category
        const parent = categoryMap.get(category.parentId)!;
        parent.children!.push(categoryWithChildren);
      } else {
        // This is a root category
        rootCategories.push(categoryWithChildren);
      }
    });

    return rootCategories;
  }

  async findOne(id: string): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ["parent", "thumbnailImage", "coverImage"],
    });

    if (!category) {
      throw new Error("Category not found");
    }

    return this.transformToResponseDto(category);
  }

  async findBySlug(slug: string): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findOne({
      where: { slug },
      relations: ["parent", "thumbnailImage", "coverImage"],
    });

    if (!category) {
      throw new Error("Category not found");
    }

    return this.transformToResponseDto(category);
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    userId?: string
  ): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new Error("Category not found");
    }

    const oldThumbnailImageId = category.thumbnailImageId;
    const oldCoverImageId = category.coverImageId;

    // Handle slug generation if name is being updated
    let slug = category.slug;
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      slug = await this.generateUniqueSlug(
        updateCategoryDto.slug || updateCategoryDto.name
      );
    }

    // Update category
    Object.assign(category, {
      ...updateCategoryDto,
      slug,
      isParent: updateCategoryDto.parentId ? true : updateCategoryDto.isParent,
    });

    const updatedCategory = await this.categoryRepository.save(category);

    // Delete old media files if they were replaced
    if (
      oldThumbnailImageId &&
      oldThumbnailImageId !== updatedCategory.thumbnailImageId
    ) {
      try {
        await mediaRepo.delete(oldThumbnailImageId);
      } catch (error) {
        console.error("Error deleting old thumbnail image:", error);
      }
    }

    if (oldCoverImageId && oldCoverImageId !== updatedCategory.coverImageId) {
      try {
        await mediaRepo.delete(oldCoverImageId);
      } catch (error) {
        console.error("Error deleting old cover image:", error);
      }
    }

    // Reload the category with relations to get the updated media files
    const categoryWithRelations = await this.categoryRepository.findOne({
      where: { id: updatedCategory.id },
      relations: ["parent", "thumbnailImage", "coverImage"],
    });

    return this.transformToResponseDto(categoryWithRelations!);
  }

  async remove(id: string): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new Error("Category not found");
    }

    // Hard delete the category
    await this.categoryRepository.delete(id);
  }

  async findSubCategories(
    parentId: string,
    query: GetCategoriesQueryDto
  ): Promise<PaginatedResponseDto<CategoryResponseDto>> {
    const {
      page = 1,
      limit = 10,
      sort = "updatedAt",
      order = "desc",
      filters = {},
    } = query;
    const skip = (page - 1) * limit;
    const { search, isActive, isFeatured, isPopular } = filters;

    // Build where conditions
    const baseConditions: FindOptionsWhere<any> = {
      parentId,
    };

    if (isActive !== undefined) baseConditions.isActive = isActive;
    if (isFeatured !== undefined) baseConditions.isFeatured = isFeatured;
    if (isPopular !== undefined) baseConditions.isPopular = isPopular;

    let where: FindOptionsWhere<any>[] | FindOptionsWhere<any> = baseConditions;

    if (search) {
      where = [
        { ...baseConditions, name: Like(`%${search}%`) },
        { ...baseConditions, slug: Like(`%${search}%`) },
        { ...baseConditions, description: Like(`%${search}%`) },
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
      relations: ["parent"],
    });

    // Transform categories to response DTO
    const categoryDtos = await Promise.all(
      categories.map((category) => this.transformToResponseDto(category))
    );

    return {
      data: categoryDtos,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findParentCategories(
    query: GetCategoriesQueryDto
  ): Promise<PaginatedResponseDto<CategoryResponseDto>> {
    const {
      page = 1,
      limit = 10,
      sort = "updatedAt",
      order = "desc",
      filters = {},
    } = query;
    const skip = (page - 1) * limit;
    const { search, isActive, isFeatured, isPopular } = filters;

    // Build where conditions for parent categories (no parentId or parentId is null)
    const baseConditions: FindOptionsWhere<any>[] = [
      { parentId: null },
      { parentId: "" },
    ];

    if (isActive !== undefined) {
      baseConditions.forEach((condition: FindOptionsWhere<any>) => {
        condition.isActive = isActive;
      });
    }
    if (isFeatured !== undefined) {
      baseConditions.forEach((condition: FindOptionsWhere<any>) => {
        condition.isFeatured = isFeatured;
      });
    }
    if (isPopular !== undefined) {
      baseConditions.forEach((condition: FindOptionsWhere<any>) => {
        condition.isPopular = isPopular;
      });
    }

    let where: FindOptionsWhere<any>[] = baseConditions;

    if (search) {
      const searchConditions: FindOptionsWhere<any>[] = [];
      baseConditions.forEach((baseCondition: FindOptionsWhere<any>) => {
        searchConditions.push(
          { ...baseCondition, name: Like(`%${search}%`) },
          { ...baseCondition, slug: Like(`%${search}%`) },
          { ...baseCondition, description: Like(`%${search}%`) }
        );
      });
      where = searchConditions;
    }

    // Get total count
    const [categories, total] = await this.categoryRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: {
        [sort]: order,
      },
      relations: ["parent"],
    });

    // Transform categories to response DTO
    const categoryDtos = await Promise.all(
      categories.map((category) => this.transformToResponseDto(category))
    );

    return {
      data: categoryDtos,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
