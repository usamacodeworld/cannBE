import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api/v1';

async function testUserRegistration() {
  console.log('👤 Testing User Registration...\n');

  const testUser = {
    firstName: "Test",
    lastName: "User",
    email: `test_${Date.now()}@example.com`,
    password: "password123",
    phone: "+1234567890"
  };

  try {
    console.log('📝 Registering user:', testUser.email);
    
    const response = await axios.post(`${BASE_URL}/users/register`, testUser);
    
    console.log('✅ User registration successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    // Test login with the new user
    console.log('\n🔐 Testing login with new user...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    console.log('✅ Login successful!');
    console.log('User ID:', loginResponse.data.data.user.id);
    console.log('User Type:', loginResponse.data.data.user.type);
    console.log('Is Active:', loginResponse.data.data.user.isActive);
    
  } catch (error: any) {
    console.log('❌ Error during registration/login:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Network Error:', error.message);
    }
  }
}

async function testDuplicateRegistration() {
  console.log('\n\n🔄 Testing Duplicate Registration...\n');

  const duplicateUser = {
    firstName: "Duplicate",
    lastName: "User",
    email: "redhorse787422@gmail.com", // Same email from your logs
    password: "password123"
  };

  try {
    console.log('📝 Attempting to register duplicate user:', duplicateUser.email);
    
    const response = await axios.post(`${BASE_URL}/users/register`, duplicateUser);
    
    console.log('⚠️ Unexpected: Duplicate registration succeeded');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error: any) {
    if (error.response?.status === 400 || error.response?.status === 409) {
      console.log('✅ Duplicate registration properly rejected');
      console.log('Error:', error.response.data.message || error.response.data.error);
    } else {
      console.log('❌ Unexpected error during duplicate registration:');
      console.log('Status:', error.response?.status);
      console.log('Error:', JSON.stringify(error.response?.data, null, 2));
    }
  }
}

async function runTests() {
  await testUserRegistration();
  await testDuplicateRegistration();
}

runTests(); 