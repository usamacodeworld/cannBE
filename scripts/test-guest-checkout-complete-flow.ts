import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

async function testCompleteGuestCheckoutFlow() {
  console.log('🧪 Testing Complete Guest Checkout Flow (Including Address Collection)...\n');

  const guestId = "guest_complete_test_" + Date.now();
  let checkoutId: string;

  try {
    // Step 1: Add item to cart as guest
    console.log('📦 Step 1: Adding item to guest cart...');
    await axios.post(`${BASE_URL}/cart/add`, {
      guestId: guestId,
      productId: "d0546dfb-8954-40ca-9d6d-9127ed81a03d",
      quantity: 2,
      selectedVariants: []
    });
    console.log('✅ Cart item added');

    // Step 2: Initiate checkout (no addresses yet)
    console.log('\n🛒 Step 2: Initiating checkout...');
    const checkoutResponse = await axios.post(`${BASE_URL}/checkout/initiate`, {
      guestId: guestId,
      shippingMethod: 'standard',
      paymentMethod: 'credit_card'
    });

    checkoutId = checkoutResponse.data.data.checkoutId;
    console.log('✅ Checkout initiated');
    console.log('Checkout ID:', checkoutId);

    // Step 3: Check initial session (should have no addresses)
    console.log('\n📋 Step 3: Checking initial session...');
    const initialSessionResponse = await axios.get(`${BASE_URL}/checkout/session/${checkoutId}`);
    const initialSession = initialSessionResponse.data.data;
    
    console.log('Initial session addresses:');
    console.log('- Shipping Address:', initialSession.shippingAddress ? '✓ Present' : '✗ Missing');
    console.log('- Billing Address:', initialSession.billingAddress ? '✓ Present' : '✗ Missing');
    
    if (!initialSession.shippingAddress) {
      console.log('🔍 As expected: No addresses yet - guest needs to provide them');
    }

    // Step 4: Guest provides addresses (this is what's missing in your flow)
    console.log('\n📮 Step 4: Guest providing shipping address...');
    const addressUpdateResponse = await axios.put(`${BASE_URL}/checkout/address`, {
      checkoutId: checkoutId,
      shippingAddress: {
        firstName: "John",
        lastName: "Doe",
        addressLine1: "123 Main Street",
        addressLine2: "Apt 4B",
        city: "New York",
        state: "NY",
        postalCode: "10001",
        country: "US",
        phone: "+1234567890",
        email: "john.doe@example.com"
      },
      billingAddressSameAsShipping: true
    });

    console.log('✅ Address provided successfully');
    const updatedSession = addressUpdateResponse.data.data.session;
    console.log('Updated session addresses:');
    console.log('- Shipping Address:', updatedSession.shippingAddress ? '✓ Present' : '✗ Missing');
    console.log('- Billing Address:', updatedSession.billingAddress ? '✓ Present' : '✗ Missing');
    console.log('- Updated Total:', updatedSession.summary.totalAmount);

    // Step 5: Verify session has addresses
    console.log('\n📋 Step 5: Verifying session has addresses...');
    const verifySessionResponse = await axios.get(`${BASE_URL}/checkout/session/${checkoutId}`);
    const verifiedSession = verifySessionResponse.data.data;
    
    console.log('Verified session:');
    console.log('- Shipping Address Present:', !!verifiedSession.shippingAddress);
    console.log('- Billing Address Present:', !!verifiedSession.billingAddress);
    
    if (verifiedSession.shippingAddress) {
      console.log('- Shipping Name:', `${verifiedSession.shippingAddress.firstName} ${verifiedSession.shippingAddress.lastName}`);
      console.log('- Shipping City:', verifiedSession.shippingAddress.city);
    }

    // Step 6: Now confirm order (should work!)
    console.log('\n💳 Step 6: Confirming order with addresses...');
    const confirmOrderResponse = await axios.post(`${BASE_URL}/checkout/confirm-order`, {
      checkoutId: checkoutId,
      guestId: guestId,
      customerInfo: {
        email: "john.doe@example.com",
        firstName: "John",
        lastName: "Doe",
        phone: "+1234567890"
      },
      paymentMethod: "credit_card",
      paymentData: {
        cardNumber: "4111111111111111",
        expiryMonth: "12",
        expiryYear: "2025",
        cvv: "123",
        cardholderName: "John Doe"
      }
    });

    console.log('✅ Order confirmed successfully!');
    const order = confirmOrderResponse.data.data.order;
    console.log('Order Details:');
    console.log('- Order Number:', order.orderNumber);
    console.log('- Total Amount:', order.totalAmount);
    console.log('- Shipping Address Present:', !!order.shippingAddress);
    console.log('- Order Status:', order.status);

    if (order.shippingAddress) {
      console.log('- Delivery To:', `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`);
      console.log('- Delivery Address:', order.shippingAddress.addressLine1);
      console.log('- Delivery City:', `${order.shippingAddress.city}, ${order.shippingAddress.state}`);
    }

    console.log('\n🎉 Complete guest checkout flow successful!');

  } catch (error: any) {
    if (error.response) {
      console.log('❌ Error Response:');
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
      
      // Specific error handling
      if (error.response.data?.error?.message?.includes('address')) {
        console.log('\n💡 Address Error: Make sure to provide shipping address before confirming order');
      }
    } else {
      console.log('❌ Network/Connection Error:', error.message);
    }
  }
}

// Test what happens if we skip address step
async function testSkippingAddressStep() {
  console.log('\n🧪 Testing What Happens When Skipping Address Step...\n');

  const guestId = "guest_skip_address_" + Date.now();

  try {
    // Add to cart and initiate checkout
    await axios.post(`${BASE_URL}/cart/add`, {
      guestId: guestId,
      productId: "d0546dfb-8954-40ca-9d6d-9127ed81a03d",
      quantity: 1,
      selectedVariants: []
    });

    const checkoutResponse = await axios.post(`${BASE_URL}/checkout/initiate`, {
      guestId: guestId,
      shippingMethod: 'standard',
      paymentMethod: 'credit_card'
    });

    const checkoutId = checkoutResponse.data.data.checkoutId;

    // Try to confirm order WITHOUT providing address
    console.log('🔍 Attempting to confirm order without providing address...');
    try {
      await axios.post(`${BASE_URL}/checkout/confirm-order`, {
        checkoutId: checkoutId,
        guestId: guestId,
        customerInfo: {
          email: "test@example.com",
          firstName: "Test",
          lastName: "User",
          phone: "+1234567890"
        },
        paymentMethod: "credit_card",
        paymentData: {
          cardNumber: "4111111111111111",
          expiryMonth: "12",
          expiryYear: "2025",
          cvv: "123",
          cardholderName: "Test User"
        }
      });
      
      console.log('⚠️ Unexpected: Order confirmed without address!');
    } catch (confirmError: any) {
      console.log('✅ Expected: Order confirmation failed without address');
      console.log('Error:', confirmError.response?.data?.error?.message || confirmError.message);
    }

  } catch (error: any) {
    console.log('❌ Test setup error:', error.response?.data || error.message);
  }
}

// Run tests
async function runTests() {
  await testCompleteGuestCheckoutFlow();
  await testSkippingAddressStep();
}

runTests(); 