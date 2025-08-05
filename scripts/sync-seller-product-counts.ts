import { AppDataSource } from '../src/config/database';
import { SellerService } from '../src/modules/seller/seller.service';
import { Repository } from 'typeorm';
import { Seller } from '../src/modules/seller/entities/seller.entity';
import { User } from '../src/modules/user/user.entity';
import { Product } from '../src/modules/products/entities/product.entity';

async function syncSellerProductCounts() {
  try {
    console.log('🔄 Starting seller product count sync...');
    
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    // Initialize repositories
    const sellerRepository = AppDataSource.getRepository(Seller);
    const userRepository = AppDataSource.getRepository(User);
    const productRepository = AppDataSource.getRepository(Product);

    // Initialize seller service
    const sellerService = new SellerService(
      sellerRepository,
      userRepository,
      productRepository,
      AppDataSource
    );

    // Update all sellers' product counts
    await sellerService.updateAllSellersProductCounts();

    console.log('✅ Seller product counts sync completed successfully!');
    
    // Display summary
    const sellers = await sellerRepository.find();
    console.log('\n📊 Summary:');
    console.log(`Total sellers: ${sellers.length}`);
    
    const sellersWithProducts = sellers.filter(s => s.totalProducts > 0);
    console.log(`Sellers with products: ${sellersWithProducts.length}`);
    
    if (sellersWithProducts.length > 0) {
      console.log('\n📋 Sellers with products:');
      sellersWithProducts.forEach(seller => {
        console.log(`  - ${seller.businessName || seller.id}: ${seller.totalProducts} products`);
      });
    }

  } catch (error) {
    console.error('❌ Error syncing seller product counts:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
    console.log('🔌 Database connection closed');
  }
}

// Run the sync
syncSellerProductCounts(); 