import { Repository, Like, FindOptionsWhere } from "typeorm";
import { Category } from "./category.entity";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { CategoryResponseDto } from "./dto/category-response.dto";
import { GetCategoriesQueryDto } from "./dto/get-categories-query.dto";
import { PaginatedResponseDto } from "../../common/dto/paginated-response.dto";
import { s3Service } from "../../libs/s3";

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
      description: category.description || "",
      image: category.image || "",
      isActive: category.isActive || false,
      isDeleted: category.isDeleted || false,
      isFeatured: category.isFeatured || false,
      isPopular: category.isPopular || false,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      parent: category.parent,
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

  private async handleImageUpload(
    imageData: string | undefined,
    imageBase64: string | undefined,
    uploadedFile: Express.Multer.File | undefined,
    categoryName: string
  ): Promise<string | undefined> {
    try {
      // Priority: uploaded file > base64 > image URL
      if (uploadedFile) {
        const result = await s3Service.uploadFile(
          uploadedFile,
          'categories',
          `${this.slugify(categoryName)}-${Date.now()}`
        );
        return result.url;
      }

      if (imageBase64) {
        // Validate base64 data
        if (!this.isValidBase64Image(imageBase64)) {
          throw new Error('Invalid base64 image data. Must be a valid data URL or base64 string.');
        }
        
        const result = await s3Service.uploadBase64Image(
          imageBase64,
          'categories',
          `${this.slugify(categoryName)}-${Date.now()}`
        );
        return result.url;
      }

      // If image is a URL, return as is
      if (imageData && (imageData.startsWith('http://') || imageData.startsWith('https://'))) {
        return imageData;
      }

      return imageData;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error(`Failed to upload image: ${error}`);
    }
  }

  private isValidBase64Image(base64Data: string): boolean {
    // Check if it's a data URL
    if (base64Data.startsWith('data:image/')) {
      return true;
    }
    
    // Check if it's a valid base64 string
    try {
      // Remove any whitespace
      const cleanData = base64Data.replace(/\s/g, '');
      
      // Check if it's valid base64
      if (cleanData.length % 4 !== 0) {
        return false;
      }
      
      // Try to decode it
      Buffer.from(cleanData, 'base64');
      return true;
    } catch {
      return false;
    }
  }

  async create(
    createCategoryDto: CreateCategoryDto,
    uploadedFile?: Express.Multer.File
  ): Promise<CategoryResponseDto> {
    const slug = await this.generateUniqueSlug(createCategoryDto.slug || createCategoryDto.name);
    
    // Handle image upload
    const imageUrl = await this.handleImageUpload(
      createCategoryDto.image,
      createCategoryDto.imageBase64,
      uploadedFile,
      createCategoryDto.name
    );

    const category = this.categoryRepository.create({
      ...createCategoryDto,
      slug,
      image: imageUrl,
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
    const categoryDtos = categories.map((category) =>
      this.transformToResponseDto(category)
    );

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

  async findOne(id: string): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findOne({
      where: { id, isDeleted: false },
      relations: ["parent"],
    });
    if (!category) {
      throw new Error(`Category with ID ${id} not found`);
    }
    return this.transformToResponseDto(category);
  }


  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    uploadedFile?: Express.Multer.File
  ): Promise<CategoryResponseDto> {
    const category = await this.findOne(id);

    // If name is being updated, generate new slug
    if (updateCategoryDto.name) {
      updateCategoryDto.slug = await this.generateUniqueSlug(
        updateCategoryDto.name
      );
    }

    // Handle image upload if provided
    if (uploadedFile || updateCategoryDto.imageBase64 || updateCategoryDto.image) {
      // Delete old image from S3 if it exists and is different from the new one
      if (category.image && 
          category.image !== updateCategoryDto.image && 
          (category.image.startsWith('http://') || category.image.startsWith('https://'))) {
        try {
          await this.deleteImageFromS3(category.image);
          console.log(`Old S3 image deleted for category: ${category.name}`);
        } catch (error) {
          console.error(`Failed to delete old S3 image for category ${category.name}:`, error);
          // Continue with update even if old image deletion fails
        }
      }

      const imageUrl = await this.handleImageUpload(
        updateCategoryDto.image,
        updateCategoryDto.imageBase64,
        uploadedFile,
        updateCategoryDto.name || category.name
      );
      updateCategoryDto.image = imageUrl;
    }

    const { parentId, imageBase64, ...dtoWithoutParentId } = updateCategoryDto;

    Object.assign(category, dtoWithoutParentId);

    if (parentId !== undefined && parentId !== category.parentId) {
      // Update via relation property
      category.parent = { id: parentId } as Category;
    }
    const updatedCategory = await this.categoryRepository.save(category);
    return this.transformToResponseDto(updatedCategory);
  }


  async remove(id: string): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!category) {
      throw new Error(`Category with ID ${id} not found`);
    }

    // Delete image from S3 if it exists
    if (category.image) {
      try {
        await this.deleteImageFromS3(category.image);
        console.log(`S3 image deleted for category: ${category.name}`);
      } catch (error) {
        console.error(`Failed to delete S3 image for category ${category.name}:`, error);
        // Continue with category deletion even if S3 deletion fails
      }
    }

    await this.categoryRepository.remove(category);
  }

  private async deleteImageFromS3(imageUrl: string): Promise<void> {
    try {
      // Extract the key from the S3 URL
      // URL format: https://bucket-name.s3.region.amazonaws.com/key
      const urlParts = imageUrl.split('.com/');
      if (urlParts.length === 2) {
        const key = urlParts[1];
        await s3Service.deleteFile(key);
      } else {
        throw new Error('Invalid S3 URL format');
      }
    } catch (error) {
      throw new Error(`Failed to delete image from S3: ${error}`);
    }
  }

  async findSubCategories(
    parentId: string,
    query: GetCategoriesQueryDto
  ): Promise<PaginatedResponseDto<CategoryResponseDto>> {
    const {
      page = 1,
      limit = 10,
      filters = {},
      sort = "createdAt",
      order = "desc",
    } = query;

    const { search, isActive, isFeatured, isPopular } = filters;

    const skip = (page - 1) * limit;

    // Build where conditions
    const whereConditions: any = {
      parentId: parentId,
      isDeleted: false,
    };

    if (search) {
      whereConditions.where = [
        { name: Like(`%${search}%`) },
        { slug: Like(`%${search}%`) },
        { description: Like(`%${search}%`) },
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
    const categoryDtos = categories.map((category) =>
      this.transformToResponseDto(category)
    );

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

  async findParentCategories(
    query: GetCategoriesQueryDto
  ): Promise<PaginatedResponseDto<CategoryResponseDto>> {
    const {
      page = 1,
      limit = 10,
      filters = {},
      sort = "createdAt",
      order = "desc",
    } = query;
    const skip = (page - 1) * limit;
    const { search, parentId, isActive, isFeatured, isPopular } = filters;
    // Build where conditions
    const whereConditions: any = {
      isParent: true,
      isDeleted: false,
    };

    if (search) {
      whereConditions.where = [
        { name: Like(`%${search}%`) },
        { slug: Like(`%${search}%`) },
        { description: Like(`%${search}%`) },
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
    const categoryDtos = categories.map((category) =>
      this.transformToResponseDto(category)
    );

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
