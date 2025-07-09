import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api/v1';

async function testCorrectCheckoutFlow() {
  console.log('✅ Testing CORRECT Checkout Flow (Same Checkout ID)...\n');

  const guestId = "correct_flow_" + Date.now();
  let checkoutId: string;

  try {
    // Step 1: Add item to cart
    console.log('📦 Step 1: Adding item to cart...');
    await axios.post(`${BASE_URL}/cart/add`, {
      guestId: guestId,
      productId: "d0546dfb-8954-40ca-9d6d-9127ed81a03d",
      quantity: 1
    });
    console.log('✅ Item added to cart');

    // Step 2: Initiate checkout FIRST (to get checkout ID)
    console.log('\n🚀 Step 2: Initiating checkout...');
    const checkoutResponse = await axios.post(`${BASE_URL}/checkout/initiate`, {
      checkoutType: 'guest',
      guestId: guestId,
      shippingMethod: 'standard',
      paymentMethod: 'credit_card'
    });

    checkoutId = checkoutResponse.data.data.checkoutId;
    console.log('✅ Checkout initiated with ID:', checkoutId);

    // Step 3: Calculate shipping using the SAME checkout ID
    console.log('\n🚚 Step 3: Calculating shipping...');
    const shippingResponse = await axios.post(`${BASE_URL}/checkout/calculate-shipping`, {
      checkoutId: checkoutId, // Use SAME checkout ID
      shippingAddress: {
        firstName: "John",
        lastName: "Doe",
        addressLine1: "123 Main Street",
        city: "New York",
        state: "NY",
        postalCode: "10001",
        country: "US"
      }
    });
    console.log('✅ Shipping calculated:', shippingResponse.data.data.shippingMethods.length, 'methods');

    // Step 4: Update address using the SAME checkout ID
    console.log('\n📮 Step 4: Updating address...');
    const addressResponse = await axios.put(`${BASE_URL}/checkout/address`, {
      checkoutId: checkoutId, // Use SAME checkout ID
      shippingAddress: {
        firstName: "John",
        lastName: "Doe",
        addressLine1: "123 Main Street",
        city: "New York",
        state: "NY",
        postalCode: "10001",
        country: "US",
        phone: "+1234567890",
        email: "john@example.com"
      },
      billingAddressSameAsShipping: true
    });
    console.log('✅ Address updated successfully');

    // Step 5: Verify session has addresses
    console.log('\n🔍 Step 5: Verifying session...');
    const sessionResponse = await axios.get(`${BASE_URL}/checkout/session/${checkoutId}`);
    const session = sessionResponse.data.data;
    
    console.log('Session verification:');
    console.log('- Checkout ID:', session.checkoutId);
    console.log('- Shipping Address:', session.shippingAddress ? '✅ Present' : '❌ Missing');
    console.log('- Billing Address:', session.billingAddress ? '✅ Present' : '❌ Missing');
    console.log('- Items:', session.items.length);
    console.log('- Total Amount:', session.summary.totalAmount);

    // Step 6: Confirm order using the SAME checkout ID
    console.log('\n💳 Step 6: Confirming order...');
    const orderResponse = await axios.post(`${BASE_URL}/checkout/confirm-order`, {
      checkoutId: checkoutId, // Use SAME checkout ID
      guestId: guestId,
      paymentMethod: "credit_card",
      paymentData: {
        cardNumber: "4242424242424242",
        expiryMonth: "12",
        expiryYear: "2025",
        cvv: "123",
        cardholderName: "John Doe"
      }
    });

    console.log('✅ Order confirmed successfully!');
    console.log('Order Number:', orderResponse.data.data.order.orderNumber);
    console.log('Order ID:', orderResponse.data.data.order.id);
    console.log('Total Amount:', orderResponse.data.data.order.totalAmount);

    console.log('\n🎉 SUCCESS: All steps completed with the SAME checkout ID!');
    console.log('Checkout ID used throughout:', checkoutId);

  } catch (error: any) {
    console.log('\n❌ Error in checkout flow:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data.error?.message || error.response.data);
    } else {
      console.log('Network Error:', error.message);
    }
  }
}

async function testShippingPreview() {
  console.log('\n\n🔍 Testing NEW Shipping Preview (No Session Required)...\n');

  try {
    // Test the new shipping preview endpoint
    const shippingPreviewResponse = await axios.post(`${BASE_URL}/checkout/calculate-shipping-preview`, {
      items: [
        {
          product: {
            name: "Test Product",
            weight: 2,
            length: 10,
            width: 8,
            height: 5
          },
          quantity: 1
        }
      ],
      shippingAddress: {
        firstName: "Jane",
        lastName: "Smith",
        addressLine1: "456 Oak Avenue",
        city: "Los Angeles",
        state: "CA",
        postalCode: "90210",
        country: "US"
      }
    });

    console.log('✅ Shipping preview calculated successfully!');
    console.log('Available methods:', shippingPreviewResponse.data.data.shippingMethods.length);
    console.log('Methods:', shippingPreviewResponse.data.data.shippingMethods.map((m: any) => `${m.name}: $${m.price}`));

  } catch (error: any) {
    console.log('❌ Shipping preview error:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data.error?.message || error.response.data);
    } else {
      console.log('Network Error:', error.message);
    }
  }
}

async function runTests() {
  await testCorrectCheckoutFlow();
  await testShippingPreview();
}

runTests(); 