"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
class ProductService {
    constructor(productRepository, variantRepository) {
        this.productRepository = productRepository;
        this.variantRepository = variantRepository;
    }
    toProductResponse(product) {
        return {
            ...product,
            variants: product.variants?.map(this.toVariantResponse) || [],
        };
    }
    toVariantResponse(variant) {
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
    async createProduct(data) {
        const { variations, ...productData } = data;
        const product = this.productRepository.create(productData);
        if (variations && Array.isArray(variations)) {
            product.variants = variations.map(v => this.variantRepository.create(v));
        }
        const saved = await this.productRepository.save(product);
        const found = await this.productRepository.findOne({ where: { id: saved.id }, relations: ['variants'] });
        if (!found)
            throw new Error('Product not found after save');
        return this.toProductResponse(found);
    }
    async findAll() {
        const products = await this.productRepository.find({ relations: ['variants'] });
        return products.map(this.toProductResponse.bind(this));
    }
    async findOne(id) {
        const product = await this.productRepository.findOne({ where: { id }, relations: ['variants'] });
        if (!product)
            throw new Error('Product not found');
        return this.toProductResponse(product);
    }
    async updateProduct(id, data) {
        const product = await this.productRepository.findOne({ where: { id }, relations: ['variants'] });
        if (!product)
            throw new Error('Product not found');
        const { variations, ...productData } = data;
        Object.assign(product, productData);
        if (variations) {
            // Remove old variants and add new
            await this.variantRepository.delete({ product: { id } });
            product.variants = variations.map(v => this.variantRepository.create(v));
        }
        const saved = await this.productRepository.save(product);
        const found = await this.productRepository.findOne({ where: { id: saved.id }, relations: ['variants'] });
        if (!found)
            throw new Error('Product not found after update');
        return this.toProductResponse(found);
    }
    async removeProduct(id) {
        const product = await this.productRepository.findOne({ where: { id } });
        if (!product)
            throw new Error('Product not found');
        await this.productRepository.remove(product);
    }
    // Variant CRUD
    async createVariant(productId, data) {
        const product = await this.productRepository.findOne({ where: { id: productId } });
        if (!product)
            throw new Error('Product not found');
        const variant = this.variantRepository.create({ ...data, product });
        const saved = await this.variantRepository.save(variant);
        return this.toVariantResponse(saved);
    }
    async updateVariant(id, data) {
        const variant = await this.variantRepository.findOne({ where: { id }, relations: ['product'] });
        if (!variant)
            throw new Error('Variant not found');
        Object.assign(variant, data);
        const saved = await this.variantRepository.save(variant);
        return this.toVariantResponse(saved);
    }
    async removeVariant(id) {
        const variant = await this.variantRepository.findOne({ where: { id } });
        if (!variant)
            throw new Error('Variant not found');
        await this.variantRepository.remove(variant);
    }
    async findVariant(id) {
        const variant = await this.variantRepository.findOne({ where: { id }, relations: ['product'] });
        if (!variant)
            throw new Error('Variant not found');
        return this.toVariantResponse(variant);
    }
    async findAllVariants(productId) {
        const variants = await this.variantRepository.find({ where: { product: { id: productId } }, relations: ['product'] });
        return variants.map(this.toVariantResponse.bind(this));
    }
}
exports.ProductService = ProductService;
