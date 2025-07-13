import { AppDataSource } from '../src/config/database';
import { ShippingRateService } from '../src/modules/shipping/shipping-rate.service';
import { ShippingRate } from '../src/modules/shipping/shipping-rate.entity';

async function testItemBasedRate() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully');

    const shippingRateRepository = AppDataSource.getRepository(ShippingRate);
    const shippingRateService = new ShippingRateService(shippingRateRepository);

    // Test the calculation logic directly
    const testRate = {
      id: 'test-rate',
      methodId: 'test-method',
      rateType: 'item_based' as const,
      baseRate: 4.99,
      additionalRate: 0,
      firstItemCount: 3,
      additionalItemRate: 1.99,
      isActive: true,
      handlingFee: 0,
      insuranceFee: 0,
      signatureFee: 0,
    } as ShippingRate;

    console.log('\n📦 Testing Item-Based Rate Calculation');
    console.log('Rate: First 3 items for $4.99, then $1.99 per additional item\n');

    // Test different item counts
    const testCases = [1, 2, 3, 4, 5, 6, 10, 15];

    for (const itemCount of testCases) {
      const totalCost = shippingRateService['calculateTotalCost'](testRate, { itemCount });
      const breakdown = shippingRateService['calculateCostBreakdown'](testRate, { itemCount });
      
      console.log(`Items: ${itemCount}`);
      console.log(`  Base Rate: $${breakdown.baseRate.toFixed(2)}`);
      console.log(`  Additional Cost: $${breakdown.additionalCost.toFixed(2)}`);
      console.log(`  Total Cost: $${totalCost.toFixed(2)}`);
      console.log('');
    }

    console.log('✅ Item-based rate calculation test completed');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

testItemBasedRate(); 