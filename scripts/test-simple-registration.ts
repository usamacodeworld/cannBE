import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api/v1';

async function testSimpleRegistration() {
  console.log('🔍 Testing Simple Registration...\n');

  const userData = {
    firstName: "Simple",
    lastName: "Test",
    email: `simple_${Date.now()}@test.com`,
    password: "password123"
  };

  try {
    console.log('📝 Sending registration request...');
    console.log('Data:', JSON.stringify(userData, null, 2));
    
    const response = await axios.post(`${BASE_URL}/users/register`, userData);
    
    console.log('✅ Registration successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error: any) {
    console.log('❌ Registration failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Headers:', error.response.headers);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Network Error:', error.message);
    }
  }
}

testSimpleRegistration(); 