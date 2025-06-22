"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductVariantSeeder = void 0;
const base_seeder_1 = require("../../../common/seeders/base.seeder");
const product_entity_1 = require("../entities/product.entity");
const product_variant_entity_1 = require("../entities/product-variant.entity");
class ProductVariantSeeder extends base_seeder_1.BaseSeeder {
    constructor(dataSource) {
        super(dataSource);
    }
    async run() {
        const productRepository = this.dataSource.getRepository(product_entity_1.Product);
        const variantRepository = this.dataSource.getRepository(product_variant_entity_1.ProductVariant);
        await variantRepository.clear();
        console.log('Cleared existing product variants');
        // Get the first product
        const product = await productRepository.findOne({ where: { id: '1' } });
        if (!product) {
            throw new Error('No product found. Please run product seeder first.');
        }
        // Example variants
        const variants = [
            variantRepository.create({
                product,
                variant: 'Size: M',
                sku: 'SKU-M',
                price: 90,
                quantity: 10,
                image: 'https://example.com/variant-m.jpg'
            }),
            variantRepository.create({
                product,
                variant: 'Size: L',
                sku: 'SKU-L',
                price: 95,
                quantity: 5,
                image: 'https://example.com/variant-l.jpg'
            })
        ];
        await this.saveMany(variants, product_variant_entity_1.ProductVariant);
        console.log('Product variants seeded successfully');
    }
}
exports.ProductVariantSeeder = ProductVariantSeeder;
