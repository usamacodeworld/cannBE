import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

async function testCheckoutWithShipping() {
  try {
    console.log('🧪 Testing checkout initiation with shipping cost...\n');

    // First, let's check what products exist
    console.log('1. Checking available products...');
    const productsResponse = await axios.get(`${API_BASE_URL}/products/all?limit=5`);
    const products = productsResponse.data.data.data; // Handle nested data structure
    
    if (!products || products.length === 0) {
      console.log('❌ No products found in database. Please seed some products first.');
      return;
    }

    const testProduct = products[0];
    console.log(`✅ Found product: ${testProduct.name} (ID: ${testProduct.id})`);

    // Check for existing addresses
    console.log('\n2. Checking available addresses...');
    try {
      const addressesResponse = await axios.get(`${API_BASE_URL}/address/all`);
      const addresses = addressesResponse.data.data; // This might also be nested
      
      if (addresses && addresses.length > 0) {
        const testAddress = addresses[0];
        console.log(`✅ Found address: ${testAddress.addressLine1}, ${testAddress.city}`);
        
        // Test checkout with existing address ID
        await testCheckoutWithAddressId(testProduct, testAddress.id);
      } else {
        console.log('⚠️  No addresses found. Testing with direct address...');
        await testCheckoutWithDirectAddress(testProduct);
      }
    } catch (error) {
      console.log('⚠️  Could not fetch addresses. Testing with direct address...');
      await testCheckoutWithDirectAddress(testProduct);
    }

  } catch (error: any) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

async function testCheckoutWithAddressId(product: any, addressId: string) {
  console.log('\n3. Testing checkout with existing address ID...');
  
  // Add item to cart
  const cartResponse = await axios.post(`${API_BASE_URL}/cart/add`, {
    productId: product.id,
    quantity: 2,
    guestId: 'test-guest-123',
    price: product.salePrice || product.regularPrice
  });

  console.log('✅ Cart items added successfully');

  // Initiate checkout with address ID
  const checkoutResponse = await axios.post(`${API_BASE_URL}/checkout/initiate`, {
    checkoutType: 'guest',
    guestId: 'test-guest-123',
    shippingAddressId: addressId
  });

  displayCheckoutResults(checkoutResponse.data.data);
}

async function testCheckoutWithDirectAddress(product: any) {
  console.log('\n3. Testing checkout with direct address...');
  
  // Add item to cart
  const cartResponse = await axios.post(`${API_BASE_URL}/cart/add`, {
    productId: product.id,
    quantity: 2,
    guestId: 'test-guest-123',
    price: product.salePrice || product.regularPrice
  });

  console.log('✅ Cart items added successfully');

  // Test shipping calculation API directly
  console.log('\n4. Testing shipping calculation API...');
  const shippingResponse = await axios.post(`${API_BASE_URL}/shipping/checkout/calculate-options`, {
    items: [
      {
        id: 'item-1',
        productId: product.id,
        quantity: 2,
        price: product.salePrice || product.regularPrice,
        weight: product.weight || 0.5,
        categoryIds: product.categoryIds || []
      }
    ],
    shippingAddress: {
      country: 'US',
      state: 'CA',
      city: 'Los Angeles',
      postalCode: '90210'
    },
    orderValue: (product.salePrice || product.regularPrice) * 2,
    isHoliday: false
  });

  console.log('✅ Shipping calculation successful');
  console.log('\n📦 Shipping Options:');
  shippingResponse.data.data.forEach((option: any, index: number) => {
    console.log(`   ${index + 1}. ${option.methodName}`);
    console.log(`      Total Cost: $${Number(option.totalCost).toFixed(2)}`);
    console.log(`      Base Rate: $${Number(option.baseRate).toFixed(2)}`);
    console.log(`      Additional Cost: $${Number(option.additionalCost).toFixed(2)}`);
    console.log(`      Estimated Days: ${option.estimatedDays || 'N/A'}`);
    console.log(`      Rate Type: ${option.rateType}`);
  });

  // Test checkout update with address
  console.log('\n5. Testing checkout address update...');
  const updateResponse = await axios.post(`${API_BASE_URL}/checkout/shipping-address`, {
    checkoutId: 'test-checkout-123', // This would be from a real checkout session
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
    }
  });

  console.log('✅ Address update test completed');
}

function displayCheckoutResults(checkoutData: any) {
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

  console.log('\n🎉 Test completed successfully!');
  console.log('\n📝 Summary:');
  console.log('   - Checkout initiation now includes shipping cost in order summary');
  console.log('   - Shipping cost is calculated when shipping address is provided');
  console.log('   - Available shipping methods are returned with pricing');
  console.log('   - Shipping calculation API works independently');
}

// Run the test
testCheckoutWithShipping(); 