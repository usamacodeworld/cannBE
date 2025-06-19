import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductVariantResponseDto } from './dto/product-variant-response.dto';

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

  async createProduct(data: CreateProductDto): Promise<ProductResponseDto> {
    const { variations, ...productData } = data;
    const product = this.productRepository.create(productData);
    if (variations && Array.isArray(variations)) {
      product.variants = variations.map(v => this.variantRepository.create(v));
    }
    const saved = await this.productRepository.save(product);
    const found = await this.productRepository.findOne({ where: { id: saved.id }, relations: ['variants'] });
    if (!found) throw new Error('Product not found after save');
    return this.toProductResponse(found);
  }

  async findAll(): Promise<ProductResponseDto[]> {
    const products = await this.productRepository.find({ relations: ['variants'] });
    return products.map(this.toProductResponse.bind(this));
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['variants'] });
    if (!product) throw new Error('Product not found');
    return this.toProductResponse(product);
  }

  async updateProduct(id: string, data: UpdateProductDto): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['variants'] });
    if (!product) throw new Error('Product not found');
    const { variations, ...productData } = data;
    Object.assign(product, productData);
    if (variations) {
      // Remove old variants and add new
      await this.variantRepository.delete({ product: { id } });
      product.variants = variations.map(v => this.variantRepository.create(v));
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