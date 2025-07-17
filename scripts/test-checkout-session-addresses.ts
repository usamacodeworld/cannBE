import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

async function testCheckoutSessionAddresses() {
  console.log('🧪 Testing Checkout Session with Addresses...\n');

  // Step 1: Create a guest cart item first
  const guestId = "test_guest_" + Date.now();
  
  try {
    // Add item to cart as guest
    console.log('📦 Adding item to guest cart...');
    const addToCartResponse = await axios.post(
      `${BASE_URL}/cart/add`,
      {
        guestId: guestId,
        productId: "d7e5a349-c861-4f05-a3d6-970f15075d33", // Use existing product ID
        quantity: 1,
        selectedVariants: []
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ Cart item added');

    // Step 2: Initiate checkout
    console.log('\n🛒 Initiating checkout...');
    const checkoutResponse = await axios.post(
      `${BASE_URL}/checkout/initiate`,
      {
        guestId: guestId,
        shippingMethod: 'standard',
        paymentMethod: 'credit_card'
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const checkoutId = checkoutResponse.data.data.checkoutId;
    console.log('✅ Checkout initiated, ID:', checkoutId);

    // Step 3: Get checkout session and check if addresses are populated
    console.log('\n📋 Getting checkout session...');
    const sessionResponse = await axios.get(
      `${BASE_URL}/checkout/session/${checkoutId}`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const session = sessionResponse.data.data;
    console.log('✅ Session retrieved');
    console.log('Session data structure:');
    console.log({
      checkoutId: session.checkoutId,
      hasItems: session.items ? session.items.length : 0,
      hasShippingAddress: !!session.shippingAddress,
      hasBillingAddress: !!session.billingAddress,
      shippingAddressId: session.shippingAddressId,
      billingAddressId: session.billingAddressId,
      userId: session.userId,
      guestId: session.guestId
    });

    // The addresses should be null since this is a guest without saved addresses
    if (!session.shippingAddress && !session.billingAddress) {
      console.log('✅ Expected: No addresses for guest checkout (guest hasn\'t saved any addresses)');
    } else {
      console.log('🔍 Addresses found:', {
        shippingAddress: session.shippingAddress,
        billingAddress: session.billingAddress
      });
    }

    // Step 4: Test with a user that has addresses (if authenticated)
    console.log('\n📝 Note: For full address testing, you would need:');
    console.log('  1. An authenticated user');
    console.log('  2. Saved addresses for that user');
    console.log('  3. Pass shippingAddressId/billingAddressId during checkout initiation');

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

// Run test
testCheckoutSessionAddresses(); 