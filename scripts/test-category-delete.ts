import dotenv from 'dotenv';
import { AppDataSource } from '../src/config/database';
import { Category } from '../src/modules/category/category.entity';
import { CategoryService } from '../src/modules/category/category.service';

// Load environment variables
dotenv.config();

// Set AWS credentials
process.env.AWS_ACCESS_KEY_ID = 'AKIATLRIUUO3CXVL7ZWR';
process.env.AWS_SECRET_ACCESS_KEY = '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';
process.env.AWS_REGION = 'us-east-1';
process.env.AWS_BUCKET_NAME = 'cannbe-files-v1';

async function testCategoryDeletion() {
  try {
    console.log('🔧 Testing category deletion with S3 image cleanup...\n');

    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    const categoryRepository = AppDataSource.getRepository(Category);
    const categoryService = new CategoryService(categoryRepository);

    // Create a test category with an image
    console.log('📝 Creating test category...');
    const testCategory = await categoryService.create({
      name: 'Test Category for Deletion',
      description: 'This category will be deleted to test S3 image cleanup',
      imageBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    });

    console.log('✅ Test category created with ID:', testCategory.id);
    console.log('📸 Category image URL:', testCategory.image);

    // Wait a moment to ensure the image is uploaded
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Now delete the category
    console.log('\n🗑️  Deleting test category...');
    await categoryService.remove(testCategory.id);
    console.log('✅ Category deleted successfully');

    console.log('\n🎉 Test completed! Check the logs above for S3 deletion attempts.');
    console.log('Note: If you see S3 deletion errors, update your IAM permissions.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Run the test
testCategoryDeletion().catch(console.error); 