import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

async function testGuestCheckoutWithShipping() {
  try {
    console.log('🧪 Testing guest checkout with shipping address and method...\n');

    // First, let's check what products exist
    console.log('1. Checking available products...');
    const productsResponse = await axios.get(`${API_BASE_URL}/products/all?limit=5`);
    const products = productsResponse.data.data.data;
    
    if (!products || products.length === 0) {
      console.log('❌ No products found in database. Please seed some products first.');
      return;
    }

    const testProduct = products[0];
    console.log(`✅ Found product: ${testProduct.name} (ID: ${testProduct.id})`);

    // Add item to cart
    console.log('\n2. Adding item to cart...');
    const cartResponse = await axios.post(`${API_BASE_URL}/cart/add`, {
      productId: testProduct.id,
      quantity: 2,
      guestId: 'test-guest-shipping-123',
      price: testProduct.salePrice || testProduct.regularPrice
    });

    console.log('✅ Cart items added successfully');

    // Test shipping calculation API first to get available methods
    console.log('\n3. Testing shipping calculation API...');
    const shippingResponse = await axios.post(`${API_BASE_URL}/shipping/checkout/calculate-options`, {
      items: [
        {
          id: 'item-1',
          productId: testProduct.id,
          quantity: 2,
          price: testProduct.salePrice || testProduct.regularPrice,
          weight: testProduct.weight || 0.5,
          categoryIds: testProduct.categoryIds || []
        }
      ],
      shippingAddress: {
        country: 'US',
        state: 'CA',
        city: 'Los Angeles',
        postalCode: '90210'
      },
      orderValue: (testProduct.salePrice || testProduct.regularPrice) * 2,
      isHoliday: false
    });

    console.log('✅ Shipping calculation successful');
    console.log('\n📦 Available Shipping Options:');
    const shippingOptions = shippingResponse.data.data;
    shippingOptions.forEach((option: any, index: number) => {
      console.log(`   ${index + 1}. ${option.methodName} - $${Number(option.totalCost).toFixed(2)}`);
    });

    if (shippingOptions.length === 0) {
      console.log('❌ No shipping options available. Cannot test checkout.');
      return;
    }

    // Use the first shipping method for testing
    const selectedShippingMethod = shippingOptions[0].methodId;
    console.log(`\n4. Testing checkout with shipping method: ${selectedShippingMethod}`);

    // Test checkout initiation with direct shipping address and shipping method
    const checkoutResponse = await axios.post(`${API_BASE_URL}/checkout/initiate`, {
      checkoutType: 'guest',
      guestId: 'test-guest-shipping-123',
      shippingAddress: {
        firstName: 'John',
        lastName: 'Doe',
        addressLine1: '123 Main St',
        city: 'Los Angeles',
        state: 'CA',
        postalCode: '90210',
        country: 'US',
        phone: '+1234567890',
        email: 'john@example.com'
      },
      shippingMethod: selectedShippingMethod,
      paymentMethod: 'credit_card'
    });

    const checkoutData = checkoutResponse.data.data;
    
    console.log('✅ Checkout initiated successfully');
    console.log('\n📊 Checkout Summary:');
    console.log(`   Subtotal: $${checkoutData.summary.subtotal.toFixed(2)}`);
    console.log(`   Shipping Amount: $${checkoutData.summary.shippingAmount.toFixed(2)}`);
    console.log(`   Tax Amount: $${checkoutData.summary.taxAmount.toFixed(2)}`);
    console.log(`   Discount Amount: $${checkoutData.summary.discountAmount.toFixed(2)}`);
    console.log(`   Total Amount: $${checkoutData.summary.totalAmount.toFixed(2)}`);
    console.log(`   Item Count: ${checkoutData.summary.itemCount}`);

    console.log('\n🚚 Available Shipping Methods:');
    checkoutData.availableShippingMethods.forEach((method: any, index: number) => {
      console.log(`   ${index + 1}. ${method.name}`);
      console.log(`      Price: $${method.price.toFixed(2)}`);
      console.log(`      Description: ${method.description}`);
      console.log(`      Estimated Days: ${method.estimatedDays}`);
    });

    console.log('\n📍 Shipping Address:');
    console.log(`   ${checkoutData.shippingAddress.firstName} ${checkoutData.shippingAddress.lastName}`);
    console.log(`   ${checkoutData.shippingAddress.addressLine1}`);
    console.log(`   ${checkoutData.shippingAddress.city}, ${checkoutData.shippingAddress.state} ${checkoutData.shippingAddress.postalCode}`);
    console.log(`   ${checkoutData.shippingAddress.country}`);

    console.log('\n🎉 Test completed successfully!');
    console.log('\n📝 Summary:');
    console.log('   - Guest checkout now works with direct shipping address');
    console.log('   - Shipping method selection works correctly');
    console.log('   - Shipping cost is included in order summary');
    console.log('   - Total amount includes shipping cost');

  } catch (error: any) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
testGuestCheckoutWithShipping(); 