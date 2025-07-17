import { DataSource } from 'typeorm';
import { dataSource } from '../src/config/typeorm.config';
import { ShippingIntegrationService } from '../src/modules/shipping/shipping-integration.service';
import { ShippingRateService } from '../src/modules/shipping/shipping-rate.service';
import { ShippingMethodService } from '../src/modules/shipping/shipping-method.service';

async function debugShippingCost() {
  console.log('🔍 Debugging shipping cost calculation...\n');

  let connection: DataSource | null = null;
  
  try {
    // Initialize database connection
    connection = dataSource;
    await connection.initialize();
    console.log('✅ Database connected');

    // Initialize services
    const shippingRateService = new ShippingRateService(connection.getRepository('ShippingRate'));
    const shippingMethodService = new ShippingMethodService(connection.getRepository('ShippingMethod'));
    const shippingIntegrationService = new ShippingIntegrationService(
      connection,
      shippingRateService,
      shippingMethodService
    );

    // Test data
    const testRequest = {
      items: [
        {
          id: 'test-item-1',
          productId: 'test-product-1',
          quantity: 3,
          price: 129.99,
          weight: 0.5,
          categoryIds: ['test-category-1']
        }
      ],
      shippingAddress: {
        country: 'US',
        state: 'CA',
        city: 'Los Angeles',
        postalCode: '90210'
      },
      orderValue: 389.97,
      isHoliday: false
    };

    console.log('📦 Test Request:');
    console.log(`   Items: ${testRequest.items.length} items`);
    console.log(`   Total Weight: ${testRequest.items.reduce((sum, item) => sum + (item.weight || 0.5) * item.quantity, 0)} lbs`);
    console.log(`   Order Value: $${testRequest.orderValue}`);
    console.log(`   Shipping Address: ${testRequest.shippingAddress.city}, ${testRequest.shippingAddress.state}, ${testRequest.shippingAddress.country}\n`);

    // 1. Test getShippingCostForMethod
    console.log('1. Testing getShippingCostForMethod...');
    
    // First, get available methods
    const methods = await shippingMethodService.getActiveMethods();
    console.log(`   Found ${methods.length} active shipping methods`);
    
    if (methods.length === 0) {
      console.log('❌ No active shipping methods found');
      return;
    }

    const testMethod = methods[0];
    console.log(`   Testing with method: ${testMethod.name} (ID: ${testMethod.id})\n`);

    const shippingCost = await shippingIntegrationService.getShippingCostForMethod(
      testMethod.id,
      testRequest
    );

    if (shippingCost) {
      console.log('✅ Shipping cost calculated successfully');
      console.log('📊 Shipping Cost Details:');
      console.log(`   Method: ${shippingCost.methodName}`);
      console.log(`   Base Rate: $${shippingCost.baseRate}`);
      console.log(`   Additional Cost: $${shippingCost.additionalCost}`);
      console.log(`   Total Cost: $${shippingCost.totalCost}`);
      console.log(`   Breakdown:`);
      console.log(`     - Base Rate: $${shippingCost.breakdown.baseRate}`);
      console.log(`     - Additional Cost: $${shippingCost.breakdown.additionalCost}`);
      console.log(`     - Handling Fee: $${shippingCost.breakdown.handlingFee}`);
      console.log(`     - Insurance Fee: $${shippingCost.breakdown.insuranceFee}`);
      console.log(`     - Signature Fee: $${shippingCost.breakdown.signatureFee}`);
      
      // Calculate total from breakdown
      const calculatedTotal = shippingCost.breakdown.baseRate + 
        shippingCost.breakdown.additionalCost + 
        shippingCost.breakdown.handlingFee + 
        shippingCost.breakdown.insuranceFee + 
        shippingCost.breakdown.signatureFee;
      
      console.log(`   Calculated Total from Breakdown: $${calculatedTotal.toFixed(2)}`);
      
      const discrepancy = Math.abs(shippingCost.totalCost - calculatedTotal);
      console.log(`   Discrepancy: $${discrepancy.toFixed(2)}`);
      
      if (discrepancy > 0.01) {
        console.log('❌ DISCREPANCY DETECTED! The totalCost does not match the breakdown sum.');
      } else {
        console.log('✅ No discrepancy detected in shipping cost calculation.');
      }
    } else {
      console.log('❌ Could not calculate shipping cost');
    }

    // 2. Test calculateShippingOptions
    console.log('\n2. Testing calculateShippingOptions...');
    
    const shippingOptions = await shippingIntegrationService.calculateShippingOptions(testRequest);
    
    console.log(`   Found ${shippingOptions.length} shipping options`);
    
    shippingOptions.forEach((option, index) => {
      console.log(`\n   Option ${index + 1}:`);
      console.log(`     Method: ${option.methodName}`);
      console.log(`     Total Cost: $${option.totalCost}`);
      console.log(`     Breakdown:`);
      console.log(`       - Base Rate: $${option.breakdown.baseRate}`);
      console.log(`       - Additional Cost: $${option.breakdown.additionalCost}`);
      console.log(`       - Handling Fee: $${option.breakdown.handlingFee}`);
      console.log(`       - Insurance Fee: $${option.breakdown.insuranceFee}`);
      console.log(`       - Signature Fee: $${option.breakdown.signatureFee}`);
      
      const calculatedTotal = option.breakdown.baseRate + 
        option.breakdown.additionalCost + 
        option.breakdown.handlingFee + 
        option.breakdown.insuranceFee + 
        option.breakdown.signatureFee;
      
      const discrepancy = Math.abs(option.totalCost - calculatedTotal);
      console.log(`     Calculated Total: $${calculatedTotal.toFixed(2)}`);
      console.log(`     Discrepancy: $${discrepancy.toFixed(2)}`);
      
      if (discrepancy > 0.01) {
        console.log(`     ❌ DISCREPANCY DETECTED!`);
      } else {
        console.log(`     ✅ No discrepancy`);
      }
    });

    // 3. Test direct shipping rate calculation
    console.log('\n3. Testing direct shipping rate calculation...');
    
    const directCalculation = await shippingRateService.calculateShippingCost({
      methodId: testMethod.id,
      weight: testRequest.items.reduce((sum, item) => sum + (item.weight || 0.5) * item.quantity, 0),
      orderValue: testRequest.orderValue,
      itemCount: testRequest.items.reduce((sum, item) => sum + item.quantity, 0),
      productIds: testRequest.items.map(item => item.productId),
      categoryIds: testRequest.items.flatMap(item => item.categoryIds || []),
      isHoliday: testRequest.isHoliday
    });

    if (directCalculation) {
      console.log('✅ Direct calculation successful');
      console.log('📊 Direct Calculation Details:');
      console.log(`   Rate Name: ${directCalculation.rate.name}`);
      console.log(`   Rate Type: ${directCalculation.rate.rateType}`);
      console.log(`   Total Cost: $${directCalculation.totalCost}`);
      console.log(`   Breakdown:`);
      console.log(`     - Base Rate: $${directCalculation.breakdown.baseRate}`);
      console.log(`     - Additional Cost: $${directCalculation.breakdown.additionalCost}`);
      console.log(`     - Handling Fee: $${directCalculation.breakdown.handlingFee}`);
      console.log(`     - Insurance Fee: $${directCalculation.breakdown.insuranceFee}`);
      console.log(`     - Signature Fee: $${directCalculation.breakdown.signatureFee}`);
      
      const calculatedTotal = directCalculation.breakdown.baseRate + 
        directCalculation.breakdown.additionalCost + 
        directCalculation.breakdown.handlingFee + 
        directCalculation.breakdown.insuranceFee + 
        directCalculation.breakdown.signatureFee;
      
      console.log(`   Calculated Total from Breakdown: $${calculatedTotal.toFixed(2)}`);
      
      const discrepancy = Math.abs(directCalculation.totalCost - calculatedTotal);
      console.log(`   Discrepancy: $${discrepancy.toFixed(2)}`);
      
      if (discrepancy > 0.01) {
        console.log('❌ DISCREPANCY DETECTED in direct calculation!');
      } else {
        console.log('✅ No discrepancy in direct calculation.');
      }
    } else {
      console.log('❌ Direct calculation failed');
    }

    console.log('\n🎯 Debug Summary:');
    console.log('   - Check if totalCost calculation matches breakdown sum');
    console.log('   - Check if fees are being double-counted');
    console.log('   - Check if there are rounding issues');
    console.log('   - Check if the discrepancy is consistent across all methods');

  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    if (connection?.isInitialized) {
      await connection.destroy();
    }
  }
}

debugShippingCost().catch(console.error); 