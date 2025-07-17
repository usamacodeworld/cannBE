import { AppDataSource } from '../src/config/database';
import { ShippingIntegrationService } from '../src/modules/shipping/shipping-integration.service';
import { ShippingRateService } from '../src/modules/shipping/shipping-rate.service';
import { ShippingMethodService } from '../src/modules/shipping/shipping-method.service';

async function testCheckoutShipping() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully');

    const shippingRateService = new ShippingRateService(
      AppDataSource.getRepository('ShippingRate')
    );
    const shippingMethodService = new ShippingMethodService(
      AppDataSource.getRepository('ShippingMethod')
    );
    const shippingIntegrationService = new ShippingIntegrationService(
      AppDataSource,
      shippingRateService,
      shippingMethodService
    );

    console.log('\n🛒 Testing Checkout Shipping Integration\n');

    // Sample checkout data
    const checkoutData = {
      items: [
        {
          id: 'item-1',
          productId: 'product-1',
          quantity: 2,
          price: 29.99,
          weight: 1.5,
          categoryIds: ['electronics']
        },
        {
          id: 'item-2',
          productId: 'product-2',
          quantity: 1,
          price: 49.99,
          weight: 2.0,
          categoryIds: ['clothing']
        }
      ],
      shippingAddress: {
        country: 'US',
        state: 'CA',
        city: 'Los Angeles',
        postalCode: '90210'
      },
      orderValue: 109.97, // (2 * 29.99) + 49.99
      isHoliday: false
    };

    console.log('📦 Checkout Items:');
    checkoutData.items.forEach(item => {
      console.log(`  - ${item.quantity}x Product ${item.productId}: $${item.price} each (${item.weight} lbs)`);
    });
    console.log(`  Total Order Value: $${checkoutData.orderValue}`);
    console.log(`  Shipping Address: ${checkoutData.shippingAddress.city}, ${checkoutData.shippingAddress.state} ${checkoutData.shippingAddress.postalCode}`);
    console.log('');

    // Test 1: Calculate all shipping options
    console.log('🚚 Test 1: Calculate All Shipping Options');
    const shippingOptions = await shippingIntegrationService.calculateShippingOptions(checkoutData);
    
    if (shippingOptions.length > 0) {
      console.log(`Found ${shippingOptions.length} shipping options:`);
      shippingOptions.forEach((option, index) => {
        console.log(`  ${index + 1}. ${option.methodName} - $${option.totalCost.toFixed(2)}`);
        console.log(`     Rate Type: ${option.rateType}`);
        console.log(`     Base Rate: $${option.baseRate.toFixed(2)}`);
        console.log(`     Additional Cost: $${option.additionalCost.toFixed(2)}`);
        console.log(`     Estimated Days: ${option.estimatedDays || 'N/A'}`);
        console.log(`     Default: ${option.isDefault ? 'Yes' : 'No'}`);
        console.log('');
      });
    } else {
      console.log('❌ No shipping options found');
    }

    // Test 2: Get default shipping option
    console.log('🎯 Test 2: Get Default Shipping Option');
    const defaultOption = await shippingIntegrationService.getDefaultShippingOption(checkoutData);
    
    if (defaultOption) {
      console.log(`Default option: ${defaultOption.methodName} - $${defaultOption.totalCost.toFixed(2)}`);
      console.log(`  Method ID: ${defaultOption.methodId}`);
      console.log(`  Rate ID: ${defaultOption.rateId}`);
      console.log('');
    } else {
      console.log('❌ No default shipping option found');
    }

    // Test 3: Get shipping cost for specific method (if available)
    if (shippingOptions.length > 0) {
      const firstMethod = shippingOptions[0];
      console.log(`🔍 Test 3: Get Shipping Cost for Method "${firstMethod.methodName}"`);
      
      const specificCost = await shippingIntegrationService.getShippingCostForMethod(
        firstMethod.methodId,
        checkoutData
      );
      
      if (specificCost) {
        console.log(`Cost for ${specificCost.methodName}: $${specificCost.totalCost.toFixed(2)}`);
        console.log(`  Breakdown:`);
        console.log(`    Base Rate: $${specificCost.breakdown.baseRate.toFixed(2)}`);
        console.log(`    Additional Cost: $${specificCost.breakdown.additionalCost.toFixed(2)}`);
        console.log(`    Handling Fee: $${specificCost.breakdown.handlingFee.toFixed(2)}`);
        console.log(`    Insurance Fee: $${specificCost.breakdown.insuranceFee.toFixed(2)}`);
        console.log(`    Signature Fee: $${specificCost.breakdown.signatureFee.toFixed(2)}`);
        console.log('');
      }
    }

    // Test 4: Validate shipping method for address
    if (shippingOptions.length > 0) {
      const firstMethod = shippingOptions[0];
      console.log(`✅ Test 4: Validate Shipping Method for Address`);
      
      const isValid = await shippingIntegrationService.validateShippingMethodForAddress(
        firstMethod.methodId,
        checkoutData.shippingAddress
      );
      
      console.log(`Method "${firstMethod.methodName}" is ${isValid ? 'valid' : 'not valid'} for this address`);
      console.log('');
    }

    console.log('✅ Checkout shipping integration test completed');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

testCheckoutShipping(); 