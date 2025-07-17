import { AppDataSource } from '../src/config/database';
import { ShippingMethod } from '../src/modules/shipping/shipping-method.entity';

async function testShippingMethods() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully');

    const shippingMethodRepository = AppDataSource.getRepository(ShippingMethod);
    
    // Check total count
    const totalCount = await shippingMethodRepository.count();
    console.log('Total shipping methods in database:', totalCount);
    
    // Get all methods without any conditions
    const allMethods = await shippingMethodRepository.find({
      relations: ['zone']
    });
    
    console.log('All shipping methods:', JSON.stringify(allMethods, null, 2));
    
    // Check with the same query as the service
    const [methods, count] = await shippingMethodRepository.findAndCount({
      relations: ['zone'],
      order: {
        name: 'asc',
      },
    });
    
    console.log('Methods from findAndCount:', count);
    console.log('Methods data:', JSON.stringify(methods, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

testShippingMethods(); 