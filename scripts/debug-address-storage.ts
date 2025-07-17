import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

async function debugAddressStorage() {
  console.log('🔍 Debugging Address Storage and Retrieval...\n');

  const guestId = "debug_guest_" + Date.now();
  let checkoutId: string;

  try {
    // Step 1: Create a cart and initiate checkout
    console.log('📦 Step 1: Setting up checkout...');
    await axios.post(`${BASE_URL}/cart/add`, {
      guestId: guestId,
      productId: "d0546dfb-8954-40ca-9d6d-9127ed81a03d", // Use the same product ID from your test
      quantity: 1,
      selectedVariants: []
    });

    const checkoutResponse = await axios.post(`${BASE_URL}/checkout/initiate`, {
      guestId: guestId,
      shippingMethod: 'standard',
      paymentMethod: 'credit_card'
    });

    checkoutId = checkoutResponse.data.data.checkoutId;
    console.log('✅ Checkout ID:', checkoutId);

    // Step 2: Check session BEFORE adding address
    console.log('\n📋 Step 2: Session BEFORE adding address...');
    const beforeResponse = await axios.get(`${BASE_URL}/checkout/session/${checkoutId}`);
    const beforeSession = beforeResponse.data.data;
    
    console.log('Before - Shipping Address:', beforeSession.shippingAddress ? 'Present' : 'NULL');
    console.log('Before - Billing Address:', beforeSession.billingAddress ? 'Present' : 'NULL');

    // Step 3: Add address
    console.log('\n📮 Step 3: Adding address...');
    const addressData = {
      checkoutId: checkoutId,
      shippingAddress: {
        firstName: "Debug",
        lastName: "User",
        addressLine1: "123 Debug Street",
        addressLine2: "Apt 1",
        city: "Debug City",
        state: "NY",
        postalCode: "12345",
        country: "US",
        phone: "+1234567890",
        email: "debug@example.com"
      },
      billingAddressSameAsShipping: true
    };

    const addressResponse = await axios.put(`${BASE_URL}/checkout/address`, addressData);
    
    console.log('✅ Address API Response Status:', addressResponse.status);
    console.log('✅ Address API Success:', addressResponse.data.success);
    
    if (addressResponse.data.data) {
      const returnedSession = addressResponse.data.data.session;
      console.log('Returned Session - Shipping Address:', returnedSession.shippingAddress ? 'Present' : 'NULL');
      console.log('Returned Session - Billing Address:', returnedSession.billingAddress ? 'Present' : 'NULL');
      
      if (returnedSession.shippingAddress) {
        console.log('Returned Shipping Name:', `${returnedSession.shippingAddress.firstName} ${returnedSession.shippingAddress.lastName}`);
      }
    }

    // Step 4: Check session AFTER adding address
    console.log('\n📋 Step 4: Session AFTER adding address...');
    const afterResponse = await axios.get(`${BASE_URL}/checkout/session/${checkoutId}`);
    const afterSession = afterResponse.data.data;
    
    console.log('After - Shipping Address:', afterSession.shippingAddress ? 'Present' : 'NULL');
    console.log('After - Billing Address:', afterSession.billingAddress ? 'Present' : 'NULL');
    
    if (afterSession.shippingAddress) {
      console.log('After - Shipping Name:', `${afterSession.shippingAddress.firstName} ${afterSession.shippingAddress.lastName}`);
      console.log('After - Shipping Address Line 1:', afterSession.shippingAddress.addressLine1);
      console.log('After - Shipping City:', afterSession.shippingAddress.city);
    } else {
      console.log('❌ PROBLEM: Address not found in session after PUT call!');
    }

    // Step 5: Wait a moment and check again (in case of Redis delay)
    console.log('\n⏱️ Step 5: Waiting 2 seconds and checking again...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const delayedResponse = await axios.get(`${BASE_URL}/checkout/session/${checkoutId}`);
    const delayedSession = delayedResponse.data.data;
    
    console.log('Delayed Check - Shipping Address:', delayedSession.shippingAddress ? 'Present' : 'NULL');
    console.log('Delayed Check - Billing Address:', delayedSession.billingAddress ? 'Present' : 'NULL');

    // Step 6: Try to confirm order and see what happens
    console.log('\n💳 Step 6: Attempting order confirmation...');
    try {
      const confirmResponse = await axios.post(`${BASE_URL}/checkout/confirm-order`, {
        checkoutId: checkoutId,
        guestId: guestId,
        customerInfo: {
          email: "debug@example.com",
          firstName: "Debug",
          lastName: "User",
          phone: "+1234567890"
        },
        paymentMethod: "credit_card",
        paymentData: {
          cardNumber: "4111111111111111",
          expiryMonth: "12",
          expiryYear: "2025",
          cvv: "123",
          cardholderName: "Debug User"
        }
      });
      
      console.log('✅ Order confirmation successful!');
      console.log('Order Number:', confirmResponse.data.data.order.orderNumber);
    } catch (confirmError: any) {
      console.log('❌ Order confirmation failed:');
      console.log('Error:', confirmError.response?.data?.error?.message || confirmError.message);
      
      if (confirmError.response?.data?.error?.message?.includes('address')) {
        console.log('🔍 This confirms the address validation is working');
      }
    }

  } catch (error: any) {
    if (error.response) {
      console.log('❌ Error Response:');
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('❌ Network/Connection Error:', error.message);
    }
  }
}

// Test with exact same checkoutId from your logs
async function testSpecificCheckoutId() {
  console.log('\n🎯 Testing with specific checkout ID from your logs...\n');
  
  const checkoutId = 'a7d9a3dd-faab-4b5b-a32f-ad61a2c7bded'; // From your logs
  
  try {
    console.log('📋 Checking session for checkout ID:', checkoutId);
    const response = await axios.get(`${BASE_URL}/checkout/session/${checkoutId}`);
    const session = response.data.data;
    
    console.log('Session found:');
    console.log('- Checkout ID:', session.checkoutId);
    console.log('- Guest ID:', session.guestId);
    console.log('- Shipping Address:', session.shippingAddress ? 'Present' : 'NULL');
    console.log('- Billing Address:', session.billingAddress ? 'Present' : 'NULL');
    console.log('- Items Count:', session.items?.length || 0);
    console.log('- Total Amount:', session.summary?.totalAmount);
    
    if (session.shippingAddress) {
      console.log('- Shipping Details:', {
        name: `${session.shippingAddress.firstName} ${session.shippingAddress.lastName}`,
        address: session.shippingAddress.addressLine1,
        city: session.shippingAddress.city
      });
    }
    
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.log('❌ Session not found - it may have expired');
    } else {
      console.log('❌ Error:', error.response?.data || error.message);
    }
  }
}

// Run both tests
async function runTests() {
  await debugAddressStorage();
  await testSpecificCheckoutId();
}

runTests(); 