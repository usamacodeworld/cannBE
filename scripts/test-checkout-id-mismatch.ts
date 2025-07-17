import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api/v1';

async function testCheckoutIdMismatch() {
  console.log('🔍 Testing Checkout ID Mismatch Issue...\n');

  try {
    // Test the two checkout IDs from your logs
    const addressCheckoutId = '970b991a-d0ea-4470-958f-e061b3b9de90';
    const confirmCheckoutId = '2731a3fd-e613-4f88-9ef0-fd3c7beb8ad1';

    console.log('📋 Checking session for ADDRESS checkout ID:', addressCheckoutId);
    try {
      const addressResponse = await axios.get(`${BASE_URL}/checkout/session/${addressCheckoutId}`);
      const addressSession = addressResponse.data.data;
      
      console.log('✅ Address Session Found:');
      console.log('- Checkout ID:', addressSession.checkoutId);
      console.log('- Guest ID:', addressSession.guestId);
      console.log('- Shipping Address:', addressSession.shippingAddress ? 'Present' : 'NULL');
      console.log('- Billing Address:', addressSession.billingAddress ? 'Present' : 'NULL');
      
      if (addressSession.shippingAddress) {
        console.log('- Shipping Name:', `${addressSession.shippingAddress.firstName} ${addressSession.shippingAddress.lastName}`);
        console.log('- Shipping Address:', addressSession.shippingAddress.addressLine1);
        console.log('- Shipping City:', addressSession.shippingAddress.city);
      }
    } catch (error: any) {
      console.log('❌ Address session not found or expired');
    }

    console.log('\n📋 Checking session for CONFIRM checkout ID:', confirmCheckoutId);
    try {
      const confirmResponse = await axios.get(`${BASE_URL}/checkout/session/${confirmCheckoutId}`);
      const confirmSession = confirmResponse.data.data;
      
      console.log('✅ Confirm Session Found:');
      console.log('- Checkout ID:', confirmSession.checkoutId);
      console.log('- Guest ID:', confirmSession.guestId);
      console.log('- Shipping Address:', confirmSession.shippingAddress ? 'Present' : 'NULL');
      console.log('- Billing Address:', confirmSession.billingAddress ? 'Present' : 'NULL');
      console.log('- Items Count:', confirmSession.items?.length || 0);
      console.log('- Total Amount:', confirmSession.summary?.totalAmount);
      
      if (confirmSession.shippingAddress) {
        console.log('- Shipping Name:', `${confirmSession.shippingAddress.firstName} ${confirmSession.shippingAddress.lastName}`);
        console.log('- Shipping Address:', confirmSession.shippingAddress.addressLine1);
        console.log('- Shipping City:', confirmSession.shippingAddress.city);
      }
    } catch (error: any) {
      console.log('❌ Confirm session not found or expired');
    }

    console.log('\n🔍 DIAGNOSIS:');
    console.log('The issue is that you are using two different checkout IDs:');
    console.log('1. Address update uses:', addressCheckoutId);
    console.log('2. Order confirmation uses:', confirmCheckoutId);
    console.log('');
    console.log('💡 SOLUTION:');
    console.log('Make sure your frontend uses the SAME checkout ID for both operations!');
    console.log('The checkout ID should be obtained from the /checkout/initiate response');
    console.log('and used consistently throughout the entire checkout flow.');

  } catch (error: any) {
    console.log('❌ Error:', error.message);
  }
}

testCheckoutIdMismatch(); 