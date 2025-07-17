import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/v1';

// Test guest migration flow
async function testGuestMigration() {
  console.log('🧪 Testing Guest Migration Flow\n');

  try {
    // Step 1: Create guest data (cart items and orders)
    console.log('1️⃣ Creating guest data...');
    const guestId = 'guest-migration-test-' + Date.now();
    
    // Add items to cart as guest
    await axios.post(`${BASE_URL}/cart/add`, {
      productId: '1',
      quantity: 2,
      guestId: guestId,
      price: 29.99
    });

    await axios.post(`${BASE_URL}/cart/add`, {
      productId: '2',
      quantity: 1,
      guestId: guestId,
      price: 49.99
    });

    console.log('✅ Guest cart items created');

    // Create a guest order (simulate checkout)
    console.log('\n2️⃣ Creating guest order...');
    const checkoutResponse = await axios.post(`${BASE_URL}/checkout/initiate`, {
      checkoutType: 'guest',
      guestId: guestId,
      shippingMethod: 'standard',
      paymentMethod: 'credit_card'
    });

    const checkoutId = checkoutResponse.data.data.checkoutId;

    // Confirm order
    await axios.post(`${BASE_URL}/checkout/confirm-order`, {
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
      notes: 'Guest order for migration test'
    });

    console.log('✅ Guest order created');

    // Step 3: Check guest data before migration
    console.log('\n3️⃣ Checking guest data...');
    const checkResponse = await axios.get(`${BASE_URL}/auth/guest-migration/check/${guestId}`);
    
    console.log('✅ Guest data check:', checkResponse.data.data);

    // Step 4: Register and migrate guest data
    console.log('\n4️⃣ Registering and migrating guest data...');
    const migrationResponse = await axios.post(`${BASE_URL}/auth/guest-migration/register`, {
      guestId: guestId,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      phone: '+1234567890'
    });

    console.log('✅ Migration completed:', migrationResponse.data.data);

    const { accessToken, user, migrationSummary } = migrationResponse.data.data;

    // Step 5: Verify migration results
    console.log('\n5️⃣ Verifying migration results...');

    // Check user cart
    const userCartResponse = await axios.get(`${BASE_URL}/cart`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    console.log('✅ User cart after migration:', userCartResponse.data.data);

    // Check user orders
    const userOrdersResponse = await axios.get(`${BASE_URL}/checkout/orders`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    console.log('✅ User orders after migration:', userOrdersResponse.data.data);

    // Check user addresses
    const userAddressesResponse = await axios.get(`${BASE_URL}/checkout/addresses`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    console.log('✅ User addresses after migration:', userAddressesResponse.data.data);

    // Step 6: Verify guest data is cleared
    console.log('\n6️⃣ Verifying guest data is cleared...');
    try {
      const guestCartResponse = await axios.get(`${BASE_URL}/cart?guestId=${guestId}`);
      console.log('❌ Guest cart should be empty:', guestCartResponse.data.data);
    } catch (error) {
      console.log('✅ Guest cart is properly cleared');
    }

    console.log('\n🎉 Guest migration test completed successfully!');
    console.log('\n📊 Migration Summary:');
    console.log(`   - Cart items migrated: ${migrationSummary.cartItemsMigrated}`);
    console.log(`   - Orders migrated: ${migrationSummary.ordersMigrated}`);
    console.log(`   - Addresses migrated: ${migrationSummary.addressesMigrated}`);

  } catch (error: any) {
    console.error('❌ Error in guest migration test:', error.response?.data || error.message);
  }
}

// Test migration with no guest data
async function testMigrationWithNoData() {
  console.log('\n🧪 Testing Migration with No Guest Data\n');

  try {
    const guestId = 'guest-no-data-' + Date.now();

    // Try to register without any guest data
    const response = await axios.post(`${BASE_URL}/auth/guest-migration/register`, {
      guestId: guestId,
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      password: 'password123',
      phone: '+1234567890'
    });

    console.log('❌ Should have failed:', response.data);

  } catch (error: any) {
    console.log('✅ Correctly rejected migration with no data:', error.response?.data?.error?.message);
  }
}

// Test duplicate email migration
async function testDuplicateEmailMigration() {
  console.log('\n🧪 Testing Migration with Duplicate Email\n');

  try {
    const guestId = 'guest-duplicate-' + Date.now();

    // First, create some guest data
    await axios.post(`${BASE_URL}/cart/add`, {
      productId: '1',
      quantity: 1,
      guestId: guestId,
      price: 29.99
    });

    // Try to register with an email that already exists
    const response = await axios.post(`${BASE_URL}/auth/guest-migration/register`, {
      guestId: guestId,
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com', // This should already exist
      password: 'password123',
      phone: '+1234567890'
    });

    console.log('❌ Should have failed:', response.data);

  } catch (error: any) {
    console.log('✅ Correctly rejected duplicate email:', error.response?.data?.error?.message);
  }
}

// Run all tests
async function runMigrationTests() {
  console.log('🚀 Starting Guest Migration Tests\n');
  
  await testGuestMigration();
  await testMigrationWithNoData();
  await testDuplicateEmailMigration();
  
  console.log('\n✨ All migration tests completed!');
}

// Run if this file is executed directly
if (require.main === module) {
  runMigrationTests().catch(console.error);
}

export { testGuestMigration, testMigrationWithNoData, testDuplicateEmailMigration }; 