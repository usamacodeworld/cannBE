import { DataSource } from 'typeorm';
import { BaseSeeder } from '../../../common/seeders/base.seeder';
import { Product } from '../entities/product.entity';
import { ProductVariant } from '../entities/product-variant.entity';

export class ProductVariantSeeder extends BaseSeeder {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const productRepository = this.dataSource.getRepository(Product);
    const variantRepository = this.dataSource.getRepository(ProductVariant);
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

    await this.saveMany(variants, ProductVariant);
    console.log('Product variants seeded successfully');
  }
} 