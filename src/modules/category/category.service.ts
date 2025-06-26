import { Repository, Like, FindOptionsWhere } from "typeorm";
import { Category } from "./category.entity";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { CategoryResponseDto } from "./dto/category-response.dto";
import { GetCategoriesQueryDto } from "./dto/get-categories-query.dto";
import { PaginatedResponseDto } from "../../common/dto/paginated-response.dto";
import { MediaService } from "../media/media.service";
import { ENTITY_TYPE } from "../media/entities/media-connect.entity";

export class CategoryService {
  private categoryRepository: Repository<Category>;

  constructor(
    categoryRepository: Repository<Category>,
    private mediaService: MediaService
  ) {
    this.categoryRepository = categoryRepository;
  }

  private async transformToResponseDto(category: Category): Promise<CategoryResponseDto> {
    // Get single media file for this category
    const mediaFile = await this.mediaService.getEntitySingleMedia(
      ENTITY_TYPE.CATEGORY,
      category.id
    );

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      mediaFiles: mediaFile ? [mediaFile] : [],
      isActive: category.isActive || false,
      isDeleted: category.isDeleted || false,
      isFeatured: category.isFeatured || false,
      isPopular: category.isPopular || false,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      parent: category.parent,
      parentId: category.parentId,
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
    const slug = await this.generateUniqueSlug(createCategoryDto.slug || createCategoryDto.name);

    const category = this.categoryRepository.create({
      ...createCategoryDto,
      slug,
      isParent: createCategoryDto.parentId ? true : createCategoryDto.isParent,
    });
    
    const savedCategory = await this.categoryRepository.save(category);

    // Handle media file connection if mediaFileId is provided
    if (createCategoryDto.mediaFileId) {
      await this.mediaService.connectSingleMediaToEntity(
        createCategoryDto.mediaFileId,
        ENTITY_TYPE.CATEGORY,
        savedCategory.id
      );
    }

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
    const baseConditions: FindOptionsWhere<any> = {
      isDeleted: false,
    };

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

  async findOne(id: string): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findOne({
      where: { id, isDeleted: false },
      relations: ["parent"],
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
      where: { id, isDeleted: false },
    });

    if (!category) {
      throw new Error("Category not found");
    }

    // Handle slug generation if name is being updated
    let slug = category.slug;
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      slug = await this.generateUniqueSlug(updateCategoryDto.slug || updateCategoryDto.name);
    }

    // Update category
    Object.assign(category, {
      ...updateCategoryDto,
      slug,
      isParent: updateCategoryDto.parentId ? true : updateCategoryDto.isParent,
    });

    const updatedCategory = await this.categoryRepository.save(category);

    // Handle media file connection if mediaFileId is provided
    if (updateCategoryDto.mediaFileId) {
      // Delete existing media connections
      await this.mediaService.deleteEntityMedia(ENTITY_TYPE.CATEGORY, id);

      // Connect new media file
      await this.mediaService.connectSingleMediaToEntity(
        updateCategoryDto.mediaFileId,
        ENTITY_TYPE.CATEGORY,
        id
      );
    }

    return this.transformToResponseDto(updatedCategory);
  }

  async remove(id: string): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!category) {
      throw new Error("Category not found");
    }

    // Delete associated media files
    await this.mediaService.deleteEntityMedia(ENTITY_TYPE.CATEGORY, id);

    // Soft delete the category
    category.isDeleted = true;
    await this.categoryRepository.save(category);
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
      isDeleted: false,
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
      { parentId: null, isDeleted: false },
      { parentId: "", isDeleted: false },
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
