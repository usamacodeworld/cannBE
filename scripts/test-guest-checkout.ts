import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/v1';

// Test guest checkout flow
async function testGuestCheckout() {
  console.log('🧪 Testing Guest Checkout Flow\n');

  try {
    // Step 1: Add items to cart as guest
    console.log('1️⃣ Adding items to cart as guest...');
    const guestId = 'guest-' + Date.now();
    
    const addToCartResponse = await axios.post(`${BASE_URL}/cart/add`, {
      productId: '1', // Assuming product ID 1 exists
      quantity: 2,
      guestId: guestId,
      price: 29.99
    });

    console.log('✅ Cart item added:', addToCartResponse.data.data);
    console.log('📦 Guest ID:', guestId);

    // Step 2: Get cart items
    console.log('\n2️⃣ Getting cart items...');
    const getCartResponse = await axios.get(`${BASE_URL}/cart?guestId=${guestId}`);
    console.log('✅ Cart items:', getCartResponse.data.data);

    // Step 3: Initiate checkout
    console.log('\n3️⃣ Initiating checkout...');
    const initiateCheckoutResponse = await axios.post(`${BASE_URL}/checkout/initiate`, {
      checkoutType: 'guest',
      guestId: guestId,
      shippingMethod: 'standard',
      paymentMethod: 'credit_card'
    });

    console.log('✅ Checkout initiated:', initiateCheckoutResponse.data.data);
    const checkoutId = initiateCheckoutResponse.data.data.checkoutId;

    // Step 4: Calculate shipping
    console.log('\n4️⃣ Calculating shipping...');
    const shippingAddress = {
      firstName: 'John',
      lastName: 'Doe',
      addressLine1: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US',
      phone: '+1234567890'
    };

    const shippingResponse = await axios.post(`${BASE_URL}/checkout/calculate-shipping`, {
      checkoutId: checkoutId,
      shippingAddress: shippingAddress
    });

    console.log('✅ Shipping calculated:', shippingResponse.data.data);

    // Step 5: Calculate tax
    console.log('\n5️⃣ Calculating tax...');
    const taxResponse = await axios.post(`${BASE_URL}/checkout/calculate-tax`, {
      checkoutId: checkoutId,
      shippingAddress: shippingAddress
    });

    console.log('✅ Tax calculated:', taxResponse.data.data);

    // Step 6: Confirm order
    console.log('\n6️⃣ Confirming order...');
    const confirmOrderResponse = await axios.post(`${BASE_URL}/checkout/confirm-order`, {
      checkoutId: checkoutId,
      guestId: guestId,
      customerInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890'
      },
      paymentMethod: 'credit_card',
      paymentData: {
        cardNumber: '4111111111111111',
        expiryMonth: '12',
        expiryYear: '2025',
        cvv: '123',
        cardholderName: 'John Doe'
      },
      notes: 'Guest order test'
    });

    console.log('✅ Order confirmed:', confirmOrderResponse.data.data);

    // Step 7: Get orders by guest ID
    console.log('\n7️⃣ Getting orders by guest ID...');
    const getOrdersResponse = await axios.get(`${BASE_URL}/checkout/orders?guestId=${guestId}`);
    console.log('✅ Orders retrieved:', getOrdersResponse.data.data);

    console.log('\n🎉 Guest checkout flow completed successfully!');

  } catch (error: any) {
    console.error('❌ Error in guest checkout flow:', error.response?.data || error.message);
  }
}

// Test authenticated user checkout flow
async function testAuthenticatedCheckout() {
  console.log('\n🧪 Testing Authenticated User Checkout Flow\n');

  try {
    // Step 1: Login (assuming you have a user)
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'user@example.com',
      password: 'password123'
    });

    const token = loginResponse.data.data.accessToken;
    const userId = loginResponse.data.data.user.id;

    console.log('✅ Logged in successfully');

    // Step 2: Add items to cart as authenticated user
    console.log('\n2️⃣ Adding items to cart as authenticated user...');
    const addToCartResponse = await axios.post(`${BASE_URL}/cart/add`, {
      productId: '1',
      quantity: 1,
      price: 29.99
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Cart item added:', addToCartResponse.data.data);

    // Step 3: Get cart items
    console.log('\n3️⃣ Getting cart items...');
    const getCartResponse = await axios.get(`${BASE_URL}/cart`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Cart items:', getCartResponse.data.data);

    // Step 4: Initiate checkout
    console.log('\n4️⃣ Initiating checkout...');
    const initiateCheckoutResponse = await axios.post(`${BASE_URL}/checkout/initiate`, {
      checkoutType: 'registered',
      shippingMethod: 'standard',
      paymentMethod: 'credit_card'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Checkout initiated:', initiateCheckoutResponse.data.data);
    const checkoutId = initiateCheckoutResponse.data.data.checkoutId;

    // Step 5: Get user addresses
    console.log('\n5️⃣ Getting user addresses...');
    const addressesResponse = await axios.get(`${BASE_URL}/checkout/addresses`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ User addresses:', addressesResponse.data.data);

    // Step 6: Confirm order
    console.log('\n6️⃣ Confirming order...');
    const confirmOrderResponse = await axios.post(`${BASE_URL}/checkout/confirm-order`, {
      checkoutId: checkoutId,
      customerInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890'
      },
      paymentMethod: 'credit_card',
      paymentData: {
        cardNumber: '4111111111111111',
        expiryMonth: '12',
        expiryYear: '2025',
        cvv: '123',
        cardholderName: 'John Doe'
      },
      notes: 'Authenticated user order test'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Order confirmed:', confirmOrderResponse.data.data);

    // Step 7: Get orders
    console.log('\n7️⃣ Getting orders...');
    const getOrdersResponse = await axios.get(`${BASE_URL}/checkout/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Orders retrieved:', getOrdersResponse.data.data);

    console.log('\n🎉 Authenticated checkout flow completed successfully!');

  } catch (error: any) {
    console.error('❌ Error in authenticated checkout flow:', error.response?.data || error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Checkout Flow Tests\n');
  
  await testGuestCheckout();
  await testAuthenticatedCheckout();
  
  console.log('\n✨ All tests completed!');
}

// Run if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

export { testGuestCheckout, testAuthenticatedCheckout }; 