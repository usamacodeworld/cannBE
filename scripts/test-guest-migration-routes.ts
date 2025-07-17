import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/guest-migration';

// Test guest migration routes
async function testGuestMigrationRoutes() {
  console.log('🧪 Testing Guest Migration Routes\n');

  try {
    // Test 1: Check guest data endpoint
    console.log('1️⃣ Testing guest data check endpoint...');
    const guestId = 'test-guest-' + Date.now();
    
    try {
      const checkResponse = await axios.get(`${BASE_URL}/guest-migration/check/${guestId}`);
      console.log('✅ Guest check endpoint working:', checkResponse.data);
    } catch (error: any) {
      if (error.response?.status === 400) {
        console.log('✅ Guest check endpoint working (expected error for non-existent guest):', error.response.data.error?.message);
      } else {
        console.error('❌ Guest check endpoint failed:', error.response?.data || error.message);
      }
    }

    // Test 2: Register endpoint (should fail without guest data)
    console.log('\n2️⃣ Testing register endpoint...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/guest-migration/register`, {
        guestId: guestId,
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123'
      });
      console.log('❌ Should have failed:', registerResponse.data);
    } catch (error: any) {
      if (error.response?.status === 400) {
        console.log('✅ Register endpoint working (expected error for no guest data):', error.response.data.error?.message);
      } else {
        console.error('❌ Register endpoint failed:', error.response?.data || error.message);
      }
    }

    console.log('\n🎉 Route testing completed!');

  } catch (error: any) {
    console.error('❌ Error testing routes:', error.response?.data || error.message);
  }
}

// Test with actual guest data
async function testWithGuestData() {
  console.log('\n🧪 Testing with actual guest data...');

  try {
    // First create some guest data
    const guestId = 'test-guest-with-data-' + Date.now();
    
    // Add to cart
    await axios.post('http://localhost:3000/api/v1/cart/add', {
      productId: '1',
      quantity: 1,
      guestId: guestId,
      price: 29.99
    });

    console.log('✅ Created guest cart data');

    // Now test the check endpoint
    const checkResponse = await axios.get(`${BASE_URL}/guest-migration/check/${guestId}`);
    console.log('✅ Guest data check with actual data:', checkResponse.data);

  } catch (error: any) {
    console.error('❌ Error testing with guest data:', error.response?.data || error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Guest Migration Route Tests\n');
  
  await testGuestMigrationRoutes();
  await testWithGuestData();
  
  console.log('\n✨ All route tests completed!');
}

// Run if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

export { testGuestMigrationRoutes, testWithGuestData }; 