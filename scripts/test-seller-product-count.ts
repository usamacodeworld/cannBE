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

async function testSellerProductCount() {
  try {
    console.log('🧪 Testing seller product count updates...');
    
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    // Initialize repositories
    const sellerRepository = AppDataSource.getRepository(Seller);
    const userRepository = AppDataSource.getRepository(User);
    const productRepository = AppDataSource.getRepository(Product);
    const attributeRepository = AppDataSource.getRepository(Attribute);
    const attributeValueRepository = AppDataSource.getRepository(AttributeValue);
    const categoryRepository = AppDataSource.getRepository(Category);
    const mediaRepository = AppDataSource.getRepository(MediaFile);

    // Initialize services
    const sellerService = new SellerService(
      sellerRepository,
      userRepository,
      productRepository,
      AppDataSource
    );

    const productService = new ProductService(
      productRepository,
      attributeRepository,
      attributeValueRepository,
      categoryRepository,
      mediaRepository,
      sellerRepository,
      sellerService
    );

    // Get first seller
    const sellers = await sellerRepository.find();
    if (sellers.length === 0) {
      console.log('❌ No sellers found. Please create a seller first.');
      return;
    }

    const seller = sellers[0];
    console.log(`📋 Testing with seller: ${seller.businessName || seller.id}`);
    console.log(`Current product count: ${seller.totalProducts}`);

    // Test creating a product
    console.log('\n🔄 Creating test product...');
    const testProductData = {
      name: 'Test Product for Seller Count',
      shortDescription: 'Test product to verify seller count updates',
      longDescription: 'This is a test product to verify that seller product counts are updated automatically.',
      regularPrice: 99.99,
      salePrice: 79.99,
      stock: 10,
      sellerId: seller.id,
      published: true,
      approved: true
    };

    const mockUser = {
      id: seller.userId,
      roles: [{ name: 'seller' }]
    };

    const testProduct = await productService.createProduct(
      testProductData,
      mockUser,
      'test-product-seller-count'
    );

    console.log(`✅ Product created: ${testProduct.id}`);

    // Check seller count after creation
    const updatedSeller = await sellerRepository.findOne({
      where: { id: seller.id }
    });
    console.log(`📊 Seller product count after creation: ${updatedSeller?.totalProducts}`);

    // Test updating the product
    console.log('\n🔄 Updating test product...');
    await productService.updateProduct(testProduct.id, {
      name: 'Updated Test Product for Seller Count'
    });

    // Check seller count after update
    const sellerAfterUpdate = await sellerRepository.findOne({
      where: { id: seller.id }
    });
    console.log(`📊 Seller product count after update: ${sellerAfterUpdate?.totalProducts}`);

    // Test deleting the product
    console.log('\n🔄 Deleting test product...');
    await productService.removeProduct(testProduct.id);

    // Check seller count after deletion
    const sellerAfterDelete = await sellerRepository.findOne({
      where: { id: seller.id }
    });
    console.log(`📊 Seller product count after deletion: ${sellerAfterDelete?.totalProducts}`);

    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await AppDataSource.destroy();
    console.log('🔌 Database connection closed');
  }
}

// Run the test
testSellerProductCount(); 