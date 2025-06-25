import { DataSource } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductVariant } from '../entities/product-variant.entity';

export class ProductSeeder {
  private dataSource: DataSource;

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  async run(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      // Truncate both tables with CASCADE
      await queryRunner.query('TRUNCATE TABLE "product_variants" CASCADE');
      await queryRunner.query('TRUNCATE TABLE "products" CASCADE');
      await queryRunner.commitTransaction();
      console.log('Cleared existing product variants and products');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    const productRepository = this.dataSource.getRepository(Product);
    const variantRepository = this.dataSource.getRepository(ProductVariant);
    // Example product
    const productObj = {
      name: 'Sample Product',
      slug: 'sample-product',
      photos: ['https://example.com/photo1.jpg'],
      thumbnailImg: 'https://example.com/thumb.jpg',
      tags: ['tag1', 'tag2'],
      shortDescription: 'Short desc',
      longDescription: 'Long desc',
      regularPrice: 100,
      salePrice: 90,
      isVariant: true,
      published: true,
      approved: true,
      stock: 50,
      cashOnDelivery: true,
      featured: false,
      discount: 10,
      discountType: 'percent',
      discountStartDate: new Date(),
      discountEndDate: new Date(),
      tax: 5,
      taxType: 'percent',
      shippingType: 'standard',
      shippingCost: 20,
      estShippingDays: 3,
      numOfSales: 0,
      metaTitle: 'Meta Title',
      metaDescription: 'Meta Description',
      rating: 4.5,
      externalLink: '',
      externalLinkBtn: '',
      addedBy: 'admin',
      userId: undefined,
      categoryId: undefined
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