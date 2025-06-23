import { Repository, Like, FindOptionsWhere, Between } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductVariantResponseDto } from './dto/product-variant-response.dto';
import { User } from '../user/user.entity';
import { cuid } from '../../libs/cuid';
import { GetProductsQueryDto } from './dto/get-products-query.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import slugify from 'slug';

export class ProductService {
  private productRepository: Repository<Product>;
  private variantRepository: Repository<ProductVariant>;

  constructor(productRepository: Repository<Product>, variantRepository: Repository<ProductVariant>) {
    this.productRepository = productRepository;
    this.variantRepository = variantRepository;
  }

  private toProductResponse(product: Product): ProductResponseDto {
    return {
      ...product,
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

  async createProduct(data: CreateProductDto, user: User, slug: string): Promise<ProductResponseDto> {
    const uniqueSlug = await this.generateUniqueSlug(slug);
    const { variations, ...productData } = data;
    const product = this.productRepository.create({
      ...productData,
      slug: uniqueSlug,
      added_by: user.roles && user.roles.length > 0 ? user.roles[0].name : 'user',
      user_id: user.id,
    });
    if (variations && Array.isArray(variations)) {
      product.variants = await Promise.all(
        variations.map(async v => {
          const uniqueSku = await this.generateUniqueSku(v.sku);
          return this.variantRepository.create({ ...v, sku: uniqueSku });
        })
      );
    }
    const saved = await this.productRepository.save(product);
    const found = await this.productRepository.findOne({ where: { id: saved.id }, relations: ['variants'] });
    if (!found) throw new Error('Product not found after save');
    return this.toProductResponse(found);
  }

  async findAll(query: GetProductsQueryDto): Promise<PaginatedResponseDto<ProductResponseDto>> {
    const { page = 1, limit = 10, sort = 'updatedAt', order = 'desc', filters = {} } = query;
    const skip = (page - 1) * limit;
    const { search, category_id, is_variant, published, featured, min_price, max_price } = filters;

    const baseConditions: FindOptionsWhere<Product> = {};

    if (category_id) baseConditions.category_id = category_id;
    if (is_variant !== undefined) baseConditions.is_variant = is_variant;
    if (published !== undefined) baseConditions.published = published;
    if (featured !== undefined) baseConditions.featured = featured;
    if (min_price !== undefined && max_price !== undefined) {
      baseConditions.sale_price = Between(min_price, max_price);
    }

    let where: FindOptionsWhere<Product>[] | FindOptionsWhere<Product> = baseConditions;

    if (search) {
      where = [
        { ...baseConditions, name: Like(`%${search}%`) },
        { ...baseConditions, slug: Like(`%${search}%`) },
        { ...baseConditions, short_description: Like(`%${search}%`) },
        { ...baseConditions, long_description: Like(`%${search}%`) },
      ];
    }

    const [products, total] = await this.productRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { [sort]: order },
      relations: ['variants'],
    });

    const productDtos = products.map(this.toProductResponse.bind(this));

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
    const product = await this.productRepository.findOne({ where: { id }, relations: ['variants'] });
    if (!product) throw new Error('Product not found');
    return this.toProductResponse(product);
  }

  async updateProduct(id: string, data: UpdateProductDto): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['variants'] });
    if (!product) throw new Error('Product not found');
    
    if (data.name && !data.slug) {
      data.slug = slugify(data.name, { lower: true });
    }

    if (data.slug) {
      data.slug = await this.generateUniqueSlug(data.slug);
    }

    const { variations, ...productData } = data;
    Object.assign(product, productData);
    if (variations) {
      // Remove old variants and add new
      await this.variantRepository.delete({ product: { id } });
      product.variants = await Promise.all(
        variations.map(async v => {
          const uniqueSku = await this.generateUniqueSku(v.sku);
          return this.variantRepository.create({ ...v, sku: uniqueSku });
        })
      );
    }
    const saved = await this.productRepository.save(product);
    const found = await this.productRepository.findOne({ where: { id: saved.id }, relations: ['variants'] });
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
    const variant = this.variantRepository.create({ ...data, product });
    const saved = await this.variantRepository.save(variant);
    return this.toVariantResponse(saved);
  }

  async updateVariant(id: string, data: UpdateProductVariantDto): Promise<ProductVariantResponseDto> {
    const variant = await this.variantRepository.findOne({ where: { id }, relations: ['product'] });
    if (!variant) throw new Error('Variant not found');
    Object.assign(variant, data);
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