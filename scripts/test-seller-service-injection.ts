import { AppDataSource } from '../src/config/database';
import { SellerService } from '../src/modules/seller/seller.service';
import { ProductService } from '../src/modules/products/product.service';
import { Repository } from 'typeorm';
import { Seller } from '../src/modules/seller/entities/seller.entity';
import { User } from '../src/modules/user/user.entity';
import { Product } from '../src/modules/products/entities/product.entity';
import { Attribute } from '../src/modules/attributes/entities/attribute.entity';
import { AttributeValue } from '../src/modules/attributes/entities/attribute-value.entity';
import { Category } from '../src/modules/category/category.entity';
import { MediaFile } from '../src/modules/media/media-file.entity';

async function testSellerServiceInjection() {
  try {
    console.log('🧪 Testing seller service injection...');
    
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    // Initialize repositories
    const productRepository = AppDataSource.getRepository(Product);
    const attributeRepository = AppDataSource.getRepository(Attribute);
    const attributeValueRepository = AppDataSource.getRepository(AttributeValue);
    const categoryRepository = AppDataSource.getRepository(Category);
    const mediaRepository = AppDataSource.getRepository(MediaFile);
    const sellerRepository = AppDataSource.getRepository(Seller);
    const userRepository = AppDataSource.getRepository(User);

    // Initialize seller service
    const sellerService = new SellerService(
      sellerRepository,
      userRepository,
      productRepository,
      AppDataSource
    );

    // Initialize product service with seller service
    const productService = new ProductService(
      productRepository,
      attributeRepository,
      attributeValueRepository,
      categoryRepository,
      mediaRepository,
      sellerRepository,
      sellerService
    );

    console.log('✅ Product service created with seller service');

    // Test if seller service methods are accessible
    console.log('🔍 Testing seller service methods...');
    
    // Check if updateSellerProductCount method exists
    if (typeof productService['sellerService']?.updateSellerProductCount === 'function') {
      console.log('✅ updateSellerProductCount method is accessible');
    } else {
      console.log('❌ updateSellerProductCount method is NOT accessible');
    }

    // Check if updateAllSellersProductCounts method exists
    if (typeof productService['sellerService']?.updateAllSellersProductCounts === 'function') {
      console.log('✅ updateAllSellersProductCounts method is accessible');
    } else {
      console.log('❌ updateAllSellersProductCounts method is NOT accessible');
    }

    console.log('\n✅ Seller service injection test completed successfully!');

  } catch (error) {
    console.error('❌ Error during seller service injection test:', error);
  } finally {
    await AppDataSource.destroy();
    console.log('🔌 Database connection closed');
  }
}

// Run the test
testSellerServiceInjection(); 