import { Repository, Like, FindOptionsWhere, Between } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { Category } from '../category/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { ProductResponseDto, CategoryInfoDto } from './dto/product-response.dto';
import { ProductVariantResponseDto } from './dto/product-variant-response.dto';
import { User } from '../user/user.entity';
import { cuid } from '../../libs/cuid';
import { GetProductsQueryDto } from './dto/get-products-query.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import slugify from 'slug';
import { s3Service } from '../../libs/s3';

export class ProductService {
  private productRepository: Repository<Product>;
  private variantRepository: Repository<ProductVariant>;

  constructor(
    productRepository: Repository<Product>, 
    variantRepository: Repository<ProductVariant>
  ) {
    this.productRepository = productRepository;
    this.variantRepository = variantRepository;
  }

  private toProductResponse(product: Product): ProductResponseDto {
    const categories: CategoryInfoDto[] = product.categories?.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      // image: category.image,
    })) || [];

    return {
      ...product,
      categories,
      variants: product.variants?.map(this.toVariantResponse) || [],
    };
  }

  private toProductListResponse(product: Product): ProductResponseDto {
    const categories: CategoryInfoDto[] = product.categories?.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      // image: category.image,
    })) || [];

    return {
      ...product,
      categories,
      variants: product.variants?.map(this.toVariantResponse) || [],
    };
  }

  private toVariantResponse(variant: ProductVariant): ProductVariantResponseDto {
    return {
      id: variant.id,
      product_id: variant.product?.id,
      variant: variant.variant,
      sku: variant.sku,
      price: variant.price,
      quantity: variant.quantity,
      image: variant.image,
      createdAt: variant.createdAt,
      updatedAt: variant.updatedAt,
    };
  }

  private async generateUniqueSlug(slug: string): Promise<string> {
    let uniqueSlug = slug;
    let count = 0;
    while (await this.productRepository.findOne({ where: { slug: uniqueSlug } })) {
      count++;
      uniqueSlug = `${slug}-${cuid().slice(-4)}`;
    }
    return uniqueSlug;
  }

  private async generateUniqueSku(sku: string): Promise<string> {
    let uniqueSku = sku;
    while (await this.variantRepository.findOne({ where: { sku: uniqueSku } })) {
      uniqueSku = `${sku}-${cuid().slice(-4)}`;
    }
    return uniqueSku;
  }

  private async handleImageUpload(
    file: Express.Multer.File | undefined,
    base64: string | undefined,
    folder: string,
    customFileName: string
  ): Promise<string | undefined> {
    if (file) {
      const result = await s3Service.uploadFile(file, folder, customFileName);
      return result.url;
    }
    if (base64) {
      const result = await s3Service.uploadBase64Image(base64, folder, customFileName);
      return result.url;
    }
    return undefined;
  }

  private async handleMultipleImageUploads(
    files: Express.Multer.File[] | undefined,
    base64s: string[] | undefined,
    folder: string,
    customFileNamePrefix: string
  ): Promise<string[]> {
    const urls: string[] = [];
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = await this.handleImageUpload(file, undefined, folder, `${customFileNamePrefix}-photo-${i}`);
        if (url) urls.push(url);
      }
    }
    if (base64s && base64s.length > 0) {
      for (let i = 0; i < base64s.length; i++) {
        const base64 = base64s[i];
        const url = await this.handleImageUpload(undefined, base64, folder, `${customFileNamePrefix}-photo-b64-${i}`);
        if (url) urls.push(url);
      }
    }
    return urls;
  }

  async createProduct(
    data: CreateProductDto,
    user: any,
    slug: string,
    thumbnailFile?: Express.Multer.File,
    photosFiles?: Express.Multer.File[],
    variantImageFiles?: Express.Multer.File[]
  ): Promise<ProductResponseDto> {
    const uniqueSlug = await this.generateUniqueSlug(slug);
    const { variations, thumbnailBase64, photosBase64, categoryIds, ...productData } = data;

    // Handle thumbnail upload
    const thumbnailUrl = await this.handleImageUpload(
      thumbnailFile,
      thumbnailBase64,
      'products',
      `${uniqueSlug}-thumbnail`
    );
    if (thumbnailUrl) productData.thumbnailImg = thumbnailUrl;

    // Handle multiple photos upload
    const photosUrls = await this.handleMultipleImageUploads(
      Array.isArray(photosFiles) ? photosFiles : undefined,
      photosBase64,
      'products',
      uniqueSlug
    );
    if (photosUrls.length > 0) productData.photos = photosUrls;

    const product = this.productRepository.create({
      ...productData,
      slug: uniqueSlug,
      addedBy: user.roles && user.roles.length > 0 ? user.roles[0].name : 'user',
      userId: user.id,
    });

    // Save product first
    const savedProduct = await this.productRepository.save(product);

    // Handle category associations
    if (categoryIds && categoryIds.length > 0) {
      const categoryRepository = this.productRepository.manager.getRepository(Category);
      const categories = await categoryRepository.findByIds(categoryIds);
      savedProduct.categories = categories;
      await this.productRepository.save(savedProduct);
    }

    // Handle variants
    if (variations && Array.isArray(variations)) {
      console.log('=== Processing Variations ===');
      console.log('Total variations:', variations.length);
      console.log('Total variant image files:', variantImageFiles?.length || 0);
      
      product.variants = await Promise.all(
        variations.map(async (v, index) => {
          console.log(`Processing variation ${index}:`, v);
          
          // Provide default values for optional fields
          const variantData = {
            variant: v.variant || `Variant ${index + 1}`,
            sku: v.sku || `SKU-${uniqueSlug}-${index + 1}`,
            price: v.price || 0,
            quantity: v.quantity || 0,
            image: v.image,
            ...v
          };
          
          const uniqueSku = v.sku ? String(v.sku) : `SKU-${uniqueSlug}-${index + 1}`;
          const fileName = `${uniqueSlug}-variant-${index}-${uniqueSku || 'default'}`;
          const { imageBase64, ...finalVariantData } = variantData;
          
          // Handle variant image upload
          let imageUrl = finalVariantData.image;
          
          // First try to use uploaded file
          if (variantImageFiles && variantImageFiles[index]) {
            console.log(`Found variant image file for index ${index}:`, variantImageFiles[index].fieldname);
            const uploadedImage = await this.handleImageUpload(
              variantImageFiles[index],
              undefined,
              'products/variants',
              fileName
            );
            if (uploadedImage) {
              imageUrl = uploadedImage;
              console.log(`Uploaded variant image for index ${index}:`, uploadedImage);
            }
          } else {
            console.log(`No variant image file found for index ${index}`);
          }
          
          // Fallback to base64 if no file
          if (!imageUrl && imageBase64) {
            console.log(`Using base64 image for variant ${index}`);
            const uploadedImage = await this.handleImageUpload(
              undefined,
              imageBase64,
              'products/variants',
              fileName
            );
            if (uploadedImage) imageUrl = uploadedImage;
          }
          
          const variant = this.variantRepository.create({ 
            ...finalVariantData, 
            sku: uniqueSku,
            image: imageUrl,
            product: savedProduct
          });
          
          console.log(`Created variant ${index} with SKU: ${uniqueSku}, Image: ${imageUrl}`);
          return variant;
        })
      );
      
      console.log('Saving all variants...');
      await this.variantRepository.save(product.variants);
      console.log('=== End Processing Variations ===');
    }

    const found = await this.productRepository.findOne({ 
      where: { id: savedProduct.id }, 
      relations: ['variants', 'categories'] 
    });
    if (!found) throw new Error('Product not found after save');
    return this.toProductResponse(found);
  }

  async findAll(query: GetProductsQueryDto): Promise<PaginatedResponseDto<any>> {
    const { page = 1, limit = 10, sort = 'updatedAt', order = 'desc', filters = {} } = query;
    const skip = (page - 1) * limit;
    const { search, categoryId, categoryIds, isVariant, published, featured, minPrice, maxPrice } = filters;

    const baseConditions: FindOptionsWhere<Product> = {};

    if (isVariant !== undefined) baseConditions.isVariant = isVariant;
    if (published !== undefined) baseConditions.published = published;
    if (featured !== undefined) baseConditions.featured = featured;
    if (minPrice !== undefined && maxPrice !== undefined) {
      baseConditions.salePrice = Between(minPrice, maxPrice);
    }

    let where: FindOptionsWhere<Product>[] | FindOptionsWhere<Product> = baseConditions;

    if (search) {
      where = [
        { ...baseConditions, name: Like(`%${search}%`) },
        { ...baseConditions, slug: Like(`%${search}%`) },
        { ...baseConditions, shortDescription: Like(`%${search}%`) },
        { ...baseConditions, longDescription: Like(`%${search}%`) },
      ];
    }

    // Handle category filtering
    let queryBuilder = this.productRepository.createQueryBuilder('product');

    // Handle category filtering - support both single and multiple categories
    if (categoryIds && categoryIds.length > 0) {
      queryBuilder = queryBuilder
        .andWhere('categories.id IN (:...categoryIds)', { categoryIds });
    } else if (categoryId) {
      // Backward compatibility for single category
      queryBuilder = queryBuilder
        .andWhere('categories.id = :categoryId', { categoryId });
    }

    if (where) {
      if (Array.isArray(where)) {
        const orConditions = where.map(condition => {
          const keys = Object.keys(condition);
          return keys.map(key => `product.${key} = :${key}`).join(' AND ');
        });
        queryBuilder = queryBuilder.andWhere(`(${orConditions.join(' OR ')})`, where.reduce((acc, curr) => ({ ...acc, ...curr }), {}));
      } else {
        const keys = Object.keys(where);
        keys.forEach(key => {
          if ((where as any)[key] !== undefined) {
            queryBuilder = queryBuilder.andWhere(`product.${key} = :${key}`, { [key]: (where as any)[key] });
          }
        });
      }
    }

    const [products, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy(`product.${sort}`, order.toUpperCase() as 'ASC' | 'DESC')
      .getManyAndCount();

    // Remove variants and categories from the response
    const productDtos = products.map((product) => {
      const { variants, categories, ...rest } = product;
      return rest;
    });

    return {
      data: productDtos,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({ 
      where: { id }, 
      relations: ['variants', 'categories'] 
    });
    if (!product) throw new Error('Product not found');
    return this.toProductResponse(product);
  }

  async updateProduct(
    id: string,
    data: UpdateProductDto,
    thumbnailFile?: Express.Multer.File,
    photosFiles?: Express.Multer.File[],
    variantImageFiles?: Express.Multer.File[]
  ): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({ 
      where: { id }, 
      relations: ['variants', 'categories'] 
    });
    if (!product) throw new Error('Product not found');
    
    if (data.name && !data.slug) {
      data.slug = slugify(data.name, { lower: true });
    }
    if (data.slug) {
      data.slug = await this.generateUniqueSlug(data.slug);
    }
    
    const { variations, thumbnailBase64, photosBase64, categoryIds, ...productData } = data;

    const uniqueSlug = (data.slug || product.slug || `product-${id}`) as string;

    // Handle thumbnail upload
    const thumbnailUrl = await this.handleImageUpload(
      thumbnailFile,
      thumbnailBase64,
      'products',
      `${uniqueSlug}-thumbnail`
    );
    if (thumbnailUrl) productData.thumbnailImg = thumbnailUrl;

    // Handle multiple photos upload
    const photosUrls = await this.handleMultipleImageUploads(
      Array.isArray(photosFiles) ? photosFiles : undefined,
      photosBase64,
      'products',
      uniqueSlug
    );
    if (photosUrls.length > 0) productData.photos = photosUrls;

    Object.assign(product, productData);
    
    // Handle category associations
    if (categoryIds && categoryIds.length > 0) {
      const categoryRepository = this.productRepository.manager.getRepository(Category);
      const categories = await categoryRepository.findByIds(categoryIds);
      product.categories = categories;
    } else if (categoryIds !== undefined) {
      // If categoryIds is explicitly set to empty array, clear categories
      product.categories = [];
    }

    // Advanced variant update logic
    if (variations && Array.isArray(variations)) {
      // Fetch all existing variants for this product
      const existingVariants = await this.variantRepository.find({ where: { product: { id } } });
      const existingSkuMap = new Map(existingVariants.map(v => [v.sku, v]));
      const incomingSkuSet = new Set(variations.map(v => v.sku));
      const updatedVariants: ProductVariant[] = [];

      for (let index = 0; index < variations.length; index++) {
        const v = variations[index];
        let variant = existingSkuMap.get(v.sku || '');
        let imageUrl = v.image;
        const { imageBase64, ...finalVariantData } = v;
        const uniqueSku = v.sku ? String(v.sku) : `SKU-${uniqueSlug}-${index + 1}`;
        const fileName = `${uniqueSlug}-variant-${index}-${uniqueSku || 'default'}`;

        // Handle variant image upload (by index)
        if (variantImageFiles && variantImageFiles[index]) {
          const uploadedImage = await this.handleImageUpload(
            variantImageFiles[index],
            undefined,
            'products/variants',
            fileName
          );
          if (uploadedImage) imageUrl = uploadedImage;
        } else if (!imageUrl && imageBase64) {
          const uploadedImage = await this.handleImageUpload(
            undefined,
            imageBase64,
            'products/variants',
            fileName
          );
          if (uploadedImage) imageUrl = uploadedImage;
        }

        if (variant) {
          // Update existing variant
          Object.assign(variant, finalVariantData, { image: imageUrl });
          updatedVariants.push(await this.variantRepository.save(variant));
        } else {
          // Create new variant
          const newVariant = this.variantRepository.create({
            ...finalVariantData,
            sku: uniqueSku,
            image: imageUrl,
            product
          });
          updatedVariants.push(await this.variantRepository.save(newVariant));
        }
      }

      // Delete variants not present in the incoming payload
      for (const existing of existingVariants) {
        if (!incomingSkuSet.has(existing.sku)) {
          await this.variantRepository.remove(existing);
        }
      }

      product.variants = updatedVariants;
    }
    
    const saved = await this.productRepository.save(product);
    const found = await this.productRepository.findOne({ 
      where: { id: saved.id }, 
      relations: ['variants', 'categories'] 
    });
    if (!found) throw new Error('Product not found after update');
    return this.toProductResponse(found);
  }

  async removeProduct(id: string): Promise<void> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) throw new Error('Product not found');
    await this.productRepository.remove(product);
  }

  // Variant CRUD
  async createVariant(productId: string, data: CreateProductVariantDto): Promise<ProductVariantResponseDto> {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) throw new Error('Product not found');
    
    // Provide default values for optional fields
    const variantData = {
      variant: data.variant || 'Default Variant',
      sku: data.sku || `SKU-${product.slug}-${Date.now()}`,
      price: data.price || 0,
      quantity: data.quantity || 0,
      image: data.image,
      ...data
    };
    
    const { imageBase64, ...finalVariantData } = variantData;
    
    // Handle variant image upload
    let imageUrl = finalVariantData.image;
    if (imageBase64) {
      const uniqueSku = await this.generateUniqueSku(variantData.sku || `SKU-${product.slug}-${Date.now()}`);
      const fileName = `${product.slug}-variant-${uniqueSku || 'default'}`;
      const uploadedImage = await this.handleImageUpload(
        undefined,
        imageBase64,
        'products/variants',
        fileName
      );
      if (uploadedImage) imageUrl = uploadedImage;
    }
    
    const variant = this.variantRepository.create({ 
      ...finalVariantData, 
      image: imageUrl,
      product 
    });
    const saved = await this.variantRepository.save(variant);
    return this.toVariantResponse(saved);
  }

  async updateVariant(id: string, data: UpdateProductVariantDto): Promise<ProductVariantResponseDto> {
    const variant = await this.variantRepository.findOne({ where: { id }, relations: ['product'] });
    if (!variant) throw new Error('Variant not found');
    
    const { imageBase64, ...variantData } = data;
    
    // Handle variant image upload
    if (imageBase64) {
      const fileName = `${variant.product.slug}-variant-${variant.sku}-updated`;
      const uploadedImage = await this.handleImageUpload(
        undefined,
        imageBase64,
        'products/variants',
        fileName
      );
      if (uploadedImage) variantData.image = uploadedImage;
    }
    
    Object.assign(variant, variantData);
    const saved = await this.variantRepository.save(variant);
    return this.toVariantResponse(saved);
  }

  async removeVariant(id: string): Promise<void> {
    const variant = await this.variantRepository.findOne({ where: { id } });
    if (!variant) throw new Error('Variant not found');
    await this.variantRepository.remove(variant);
  }

  async findVariant(id: string): Promise<ProductVariantResponseDto> {
    const variant = await this.variantRepository.findOne({ where: { id }, relations: ['product'] });
    if (!variant) throw new Error('Variant not found');
    return this.toVariantResponse(variant);
  }

  async findAllVariants(productId: string): Promise<ProductVariantResponseDto[]> {
    const variants = await this.variantRepository.find({ where: { product: { id: productId } }, relations: ['product'] });
    return variants.map(this.toVariantResponse.bind(this));
  }
}