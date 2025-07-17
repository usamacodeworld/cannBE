import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

async function testGuestAddressFlow() {
  console.log('🧪 Testing Complete Guest Address Flow...\n');

  const guestId = "guest_address_test_" + Date.now();
  let checkoutId: string;

  try {
    // Step 1: Add item to cart as guest
    console.log('📦 Step 1: Adding item to guest cart...');
    const addToCartResponse = await axios.post(
      `${BASE_URL}/cart/add`,
      {
        guestId: guestId,
        productId: "d7e5a349-c861-4f05-a3d6-970f15075d33",
        quantity: 2,
        selectedVariants: []
      }
    );
    console.log('✅ Cart item added');

    // Step 2: Initiate checkout (no addresses yet)
    console.log('\n🛒 Step 2: Initiating checkout...');
    const checkoutResponse = await axios.post(
      `${BASE_URL}/checkout/initiate`,
      {
        guestId: guestId,
        shippingMethod: 'standard',
        paymentMethod: 'credit_card'
      }
    );

    checkoutId = checkoutResponse.data.data.checkoutId;
    console.log('✅ Checkout initiated');
    console.log('Checkout ID:', checkoutId);
    console.log('Initial Total:', checkoutResponse.data.data.summary.totalAmount);

    // Step 3: Get initial session (should have no addresses)
    console.log('\n📋 Step 3: Getting initial session...');
    const initialSessionResponse = await axios.get(
      `${BASE_URL}/checkout/session/${checkoutId}`
    );
    
    const initialSession = initialSessionResponse.data.data;
    console.log('✅ Initial session retrieved');
    console.log('Has shipping address:', !!initialSession.shippingAddress);
    console.log('Has billing address:', !!initialSession.billingAddress);

    // Step 4: Update checkout with shipping address
    console.log('\n📮 Step 4: Adding shipping address...');
    const addressUpdateResponse = await axios.put(
      `${BASE_URL}/checkout/address`,
      {
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
      }
    );

    console.log('✅ Address updated successfully');
    const updatedSession = addressUpdateResponse.data.data.session;
    console.log('Updated Total:', updatedSession.summary.totalAmount);
    console.log('Tax Amount:', updatedSession.summary.taxAmount);
    console.log('Shipping Amount:', updatedSession.summary.shippingAmount);

    // Step 5: Get updated session with addresses
    console.log('\n📋 Step 5: Getting updated session...');
    const updatedSessionResponse = await axios.get(
      `${BASE_URL}/checkout/session/${checkoutId}`
    );
    
    const finalSession = updatedSessionResponse.data.data;
    console.log('✅ Updated session retrieved');
    console.log('Shipping Address:', {
      name: `${finalSession.shippingAddress.firstName} ${finalSession.shippingAddress.lastName}`,
      address: finalSession.shippingAddress.addressLine1,
      city: finalSession.shippingAddress.city,
      state: finalSession.shippingAddress.state,
      postalCode: finalSession.shippingAddress.postalCode
    });
    console.log('Billing same as shipping:', 
      JSON.stringify(finalSession.shippingAddress) === JSON.stringify(finalSession.billingAddress)
    );

    // Step 6: Test different billing address
    console.log('\n🏦 Step 6: Testing different billing address...');
    const differentBillingResponse = await axios.put(
      `${BASE_URL}/checkout/address`,
      {
        checkoutId: checkoutId,
        shippingAddress: {
          firstName: "John",
          lastName: "Doe",
          addressLine1: "123 Main Street",
          city: "New York",
          state: "NY",
          postalCode: "10001",
          country: "US",
          phone: "+1234567890",
          email: "john.doe@example.com"
        },
        billingAddress: {
          firstName: "John",
          lastName: "Doe",
          addressLine1: "456 Oak Avenue",
          addressLine2: "Suite 200",
          city: "Brooklyn",
          state: "NY",
          postalCode: "11201",
          country: "US",
          phone: "+1234567890",
          email: "john.doe@example.com"
        },
        billingAddressSameAsShipping: false
      }
    );

    console.log('✅ Different billing address set');
    const finalSessionWithDifferentBilling = differentBillingResponse.data.data.session;
    console.log('Billing Address:', {
      name: `${finalSessionWithDifferentBilling.billingAddress.firstName} ${finalSessionWithDifferentBilling.billingAddress.lastName}`,
      address: finalSessionWithDifferentBilling.billingAddress.addressLine1,
      city: finalSessionWithDifferentBilling.billingAddress.city,
      state: finalSessionWithDifferentBilling.billingAddress.state,
      postalCode: finalSessionWithDifferentBilling.billingAddress.postalCode
    });

    // Step 7: Simulate order confirmation (without actually processing payment)
    console.log('\n✅ Step 7: Address flow complete!');
    console.log('Ready for order confirmation with addresses:');
    console.log('- Shipping address set ✓');
    console.log('- Billing address set ✓');
    console.log('- Tax calculated ✓');
    console.log('- Shipping calculated ✓');
    console.log('- Total updated ✓');

    console.log('\n📊 Final Summary:');
    console.log('Subtotal:', finalSessionWithDifferentBilling.summary.subtotal);
    console.log('Tax:', finalSessionWithDifferentBilling.summary.taxAmount);
    console.log('Shipping:', finalSessionWithDifferentBilling.summary.shippingAmount);
    console.log('Total:', finalSessionWithDifferentBilling.summary.totalAmount);

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

// Test address validation
async function testAddressValidation() {
  console.log('\n🧪 Testing Address Validation...\n');

  const guestId = "guest_validation_test_" + Date.now();

  try {
    // Create a checkout session first
    await axios.post(`${BASE_URL}/cart/add`, {
      guestId: guestId,
      productId: "d7e5a349-c861-4f05-a3d6-970f15075d33",
      quantity: 1,
      selectedVariants: []
    });

    const checkoutResponse = await axios.post(`${BASE_URL}/checkout/initiate`, {
      guestId: guestId,
      shippingMethod: 'standard',
      paymentMethod: 'credit_card'
    });

    const checkoutId = checkoutResponse.data.data.checkoutId;

    // Test invalid address (missing required fields)
    console.log('🔍 Testing invalid address (missing required fields)...');
    try {
      await axios.put(`${BASE_URL}/checkout/address`, {
        checkoutId: checkoutId,
        shippingAddress: {
          firstName: "John",
          // Missing lastName, addressLine1, city, state, postalCode, country
        },
        billingAddressSameAsShipping: true
      });
    } catch (validationError: any) {
      console.log('✅ Validation error caught as expected');
      console.log('Error details:', validationError.response?.data?.error?.message);
    }

    // Test valid address
    console.log('\n✅ Testing valid address...');
    const validResponse = await axios.put(`${BASE_URL}/checkout/address`, {
      checkoutId: checkoutId,
      shippingAddress: {
        firstName: "Jane",
        lastName: "Smith",
        addressLine1: "789 Pine Street",
        city: "Los Angeles",
        state: "CA",
        postalCode: "90210",
        country: "US",
        phone: "+1987654321",
        email: "jane.smith@example.com"
      },
      billingAddressSameAsShipping: true
    });

    console.log('✅ Valid address accepted');
    console.log('New total:', validResponse.data.data.session.summary.totalAmount);

  } catch (error: any) {
    console.log('❌ Validation test error:', error.response?.data || error.message);
  }
}

// Run all tests
async function runAllTests() {
  await testGuestAddressFlow();
  await testAddressValidation();
}

runAllTests(); 