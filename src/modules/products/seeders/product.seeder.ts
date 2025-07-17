import { BaseSeeder } from '../../../common/seeders/base.seeder';
import { Product } from '../entities/product.entity';
import { SellerSeeder } from '../../seller/seeders/seller.seeder';

export class ProductSeeder extends BaseSeeder {
  async run(): Promise<void> {
    const productRepository = this.dataSource.getRepository(Product);

    // Get seller IDs from SellerSeeder
    const sellerIds = SellerSeeder.createdSellerIds;

    const products = [
      {
        name: 'Sample Product 1',
        slug: 'sample-product-1',
        shortDescription: 'This is a sample product description',
        longDescription: 'This is a detailed description of the sample product',
        regularPrice: 99.99,
        salePrice: 79.99,
        stock: 100,
        published: true,
        approved: true,
        featured: false,
        tags: ['sample', 'test'],
        addedBy: 'admin',
        userId: '1',
        sellerId: sellerIds[0] || null,
        thumbnailImgId: null,
        metaTitle: 'Sample Product 1 - Your Store',
        metaDescription: 'Buy Sample Product 1 at great prices',
        rating: 4.5,
        numOfSales: 0,
        cashOnDelivery: true,
        discount: 20,
        discountType: 'percentage',
        tax: 5,
        taxType: 'percentage',
        shippingType: 'standard',
        shippingCost: 10,
        estShippingDays: 3,
      },
      {
        name: 'Sample Product 2',
        slug: 'sample-product-2',
        shortDescription: 'Another sample product',
        longDescription: 'Detailed description of the second sample product',
        regularPrice: 149.99,
        salePrice: 129.99,
        stock: 50,
        published: true,
        approved: true,
        featured: true,
        tags: ['featured', 'premium'],
        addedBy: 'admin',
        userId: '1',
        sellerId: sellerIds[1] || null,
        thumbnailImgId: null,
        metaTitle: 'Sample Product 2 - Your Store',
        metaDescription: 'Premium Sample Product 2 available now',
        rating: 4.8,
        numOfSales: 25,
        cashOnDelivery: false,
        discount: 13.33,
        discountType: 'percentage',
        tax: 5,
        taxType: 'percentage',
        shippingType: 'express',
        shippingCost: 15,
        estShippingDays: 1,
      },
    ];

    await this.saveMany(products, Product);
  }
} 