import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

async function testGuestMigrationFix() {
  console.log('🧪 Testing Guest Migration Fix...\n');

  const testPayload = {
    guestId: "gms6x247sys7v843j940jnsx",
    firstName: "Usama",
    lastName: "Akhtar",
    email: "redhorse7422@gmail.com",
    password: "password",
    phone: "+1234567890"
  };

  try {
    console.log('📤 Sending guest migration request...');
    console.log('Payload:', JSON.stringify(testPayload, null, 2));

    const response = await axios.post(
      `${BASE_URL}/guest-migration/register`,
      testPayload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Success!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error: any) {
    if (error.response) {
      console.log('❌ Error Response:');
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
      
      // Check if the error is still the userName constraint
      if (error.response.data?.error?.message?.includes('userName')) {
        console.log('\n🔍 Issue: userName constraint still present');
        console.log('💡 Suggestion: Check if migration was applied correctly');
      } else if (error.response.data?.error?.message?.includes('already exists')) {
        console.log('\n✅ userName constraint fixed! Error is now about duplicate email (expected)');
      }
    } else {
      console.log('❌ Network/Connection Error:', error.message);
    }
  }
}

// Test with different email to avoid duplicate error
async function testWithNewEmail() {
  console.log('\n🧪 Testing with new email to avoid duplicate constraint...\n');

  const testPayload = {
    guestId: "test_guest_" + Date.now(),
    firstName: "Test",
    lastName: "User",
    email: `test${Date.now()}@example.com`,
    password: "password123",
    phone: "+1234567890"
  };

  try {
    console.log('📤 Sending guest migration request with new email...');
    console.log('Payload:', JSON.stringify(testPayload, null, 2));

    const response = await axios.post(
      `${BASE_URL}/guest-migration/register`,
      testPayload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Success! Guest migration working properly');
    console.log('User created:', {
      id: response.data.data?.user?.id,
      email: response.data.data?.user?.email,
      accessToken: response.data.data?.accessToken ? '✓ Present' : '✗ Missing'
    });
    
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

// Run tests
async function runTests() {
  await testGuestMigrationFix();
  await testWithNewEmail();
}

runTests(); 