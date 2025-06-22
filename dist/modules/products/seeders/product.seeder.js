"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductSeeder = void 0;
const product_entity_1 = require("../entities/product.entity");
const product_variant_entity_1 = require("../entities/product-variant.entity");
class ProductSeeder {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async run() {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        try {
            await queryRunner.startTransaction();
            // Truncate both tables with CASCADE
            await queryRunner.query('TRUNCATE TABLE "product_variants" CASCADE');
            await queryRunner.query('TRUNCATE TABLE "products" CASCADE');
            await queryRunner.commitTransaction();
            console.log('Cleared existing product variants and products');
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
        const productRepository = this.dataSource.getRepository(product_entity_1.Product);
        const variantRepository = this.dataSource.getRepository(product_variant_entity_1.ProductVariant);
        // Example product
        const productObj = {
            name: 'Sample Product',
            slug: 'sample-product',
            photos: ['https://example.com/photo1.jpg'],
            thumbnail_img: 'https://example.com/thumb.jpg',
            tags: ['tag1', 'tag2'],
            short_description: 'Short desc',
            long_description: 'Long desc',
            regular_price: 100,
            sale_price: 90,
            is_variant: true,
            published: true,
            approved: true,
            stock: 50,
            cash_on_delivery: true,
            featured: false,
            discount: 10,
            discount_type: 'percent',
            discount_start_date: new Date(),
            discount_end_date: new Date(),
            tax: 5,
            tax_type: 'percent',
            shipping_type: 'standard',
            shipping_cose: 20,
            est_shipping_days: 3,
            num_of_sales: 0,
            meta_title: 'Meta Title',
            meta_description: 'Meta Description',
            rating: 4.5,
            external_link: '',
            external_link_btn: '',
            added_by: 'admin',
            user_id: undefined,
            category_id: undefined
        };
        const savedProduct = await productRepository.save(productObj);
        // Example variants for the product
        const variants = [
            {
                product: savedProduct,
                variant: 'Size: M',
                sku: 'SKU-M',
                price: 90,
                quantity: 10,
                image: 'https://example.com/variant-m.jpg'
            },
            {
                product: savedProduct,
                variant: 'Size: L',
                sku: 'SKU-L',
                price: 95,
                quantity: 5,
                image: 'https://example.com/variant-l.jpg'
            }
        ];
        await variantRepository.save(variants);
        console.log('Product and variants seeded successfully');
    }
}
exports.ProductSeeder = ProductSeeder;
