import { PaymentService } from '../src/common/services/payment.service';
import { PAYMENT_METHOD, PAYMENT_STATUS } from '../src/modules/checkout/entities/order.entity';

async function testAuthorizeNetPayment() {
  console.log('Testing Authorize.net Payment Integration...\n');

  const paymentService = new PaymentService();

  // Test payment request
  const paymentRequest = {
    amount: 99.99,
    currency: 'USD',
    paymentMethod: PAYMENT_METHOD.CREDIT_CARD,
    paymentData: {
      cardNumber: '4242424242424242', // Test card number
      expiryMonth: '12',
      expiryYear: '2025',
      cvv: '123',
      cardholderName: 'John Doe',
      billingAddress: {
        addressLine1: '123 Test Street',
        city: 'Test City',
        state: 'CA',
        postalCode: '12345',
        country: 'USA'
      }
    },
    orderId: 'test-order-123',
    orderNumber: 'INV-12345',
    customerEmail: 'test@example.com',
    customerName: 'John Doe',
    description: 'Test payment for Authorize.net integration'
  };

  try {
    console.log('Processing payment...');
    const result = await paymentService.processPayment(paymentRequest);
    
    console.log('Payment Result:');
    console.log('Success:', result.success);
    console.log('Transaction ID:', result.transactionId);
    console.log('Payment Status:', result.paymentStatus);
    
    if (result.error) {
      console.log('Error:', result.error);
    }
    
    if (result.success && result.transactionId) {
      console.log('\nTesting refund...');
      const refundRequest = {
        transactionId: result.transactionId,
        amount: 99.99,
        reason: 'Test refund',
        orderId: 'test-order-123'
      };
      
      const refundResult = await paymentService.refundPayment(refundRequest);
      console.log('Refund Result:');
      console.log('Success:', refundResult.success);
      console.log('Refund ID:', refundResult.refundId);
      
      if (refundResult.error) {
        console.log('Refund Error:', refundResult.error);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testAuthorizeNetPayment().then(() => {
  console.log('\nTest completed.');
  process.exit(0);
}).catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
}); 