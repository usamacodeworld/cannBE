import { PaymentService } from '../src/common/services/payment.service';
import { PAYMENT_METHOD } from '../src/modules/checkout/entities/order.entity';

/**
 * Example: Complete E-commerce Payment Flow with Authorize.net
 * 
 * This example demonstrates a typical e-commerce payment flow including:
 * 1. Processing a payment
 * 2. Handling successful payments
 * 3. Processing refunds
 * 4. Error handling
 */

async function ecommercePaymentExample() {
  console.log('=== E-commerce Payment Flow Example ===\n');

  const paymentService = new PaymentService();

  // Example 1: Successful Payment
  console.log('1. Processing a successful payment...');
  
  const successfulPaymentRequest = {
    amount: 149.99,
    currency: 'USD',
    paymentMethod: PAYMENT_METHOD.CREDIT_CARD,
    paymentData: {
      cardNumber: '4242424242424242', // Test Visa card
      expiryMonth: '12',
      expiryYear: '2025',
      cvv: '123',
      cardholderName: 'John Smith',
      billingAddress: {
        addressLine1: '123 Main Street',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA'
      }
    },
    orderId: 'order-2024-001',
    orderNumber: 'INV-2024-001',
    customerEmail: 'john.smith@example.com',
    customerName: 'John Smith',
    description: 'Premium Product Package'
  };

  try {
    const paymentResult = await paymentService.processPayment(successfulPaymentRequest);
    
    if (paymentResult.success) {
      console.log('✅ Payment successful!');
      console.log(`   Transaction ID: ${paymentResult.transactionId}`);
      console.log(`   Amount: $${successfulPaymentRequest.amount}`);
      console.log(`   Status: ${paymentResult.paymentStatus}`);
      
      // Example 2: Process Refund
      console.log('\n2. Processing refund...');
      
      const refundRequest = {
        transactionId: paymentResult.transactionId!,
        amount: 149.99,
        reason: 'Customer requested refund',
        orderId: 'order-2024-001'
      };
      
      const refundResult = await paymentService.refundPayment(refundRequest);
      
      if (refundResult.success) {
        console.log('✅ Refund successful!');
        console.log(`   Refund ID: ${refundResult.refundId}`);
        console.log(`   Amount: $${refundRequest.amount}`);
      } else {
        console.log('❌ Refund failed:', refundResult.error);
      }
      
    } else {
      console.log('❌ Payment failed:', paymentResult.error);
    }
    
  } catch (error) {
    console.error('❌ Payment processing error:', error);
  }

  // Example 3: Declined Payment
  console.log('\n3. Testing declined payment...');
  
  const declinedPaymentRequest = {
    amount: 99.99,
    currency: 'USD',
    paymentMethod: PAYMENT_METHOD.CREDIT_CARD,
    paymentData: {
      cardNumber: '4000000000000002', // Test declined card
      expiryMonth: '12',
      expiryYear: '2025',
      cvv: '123',
      cardholderName: 'Jane Doe',
      billingAddress: {
        addressLine1: '456 Oak Avenue',
        city: 'Los Angeles',
        state: 'CA',
        postalCode: '90210',
        country: 'USA'
      }
    },
    orderId: 'order-2024-002',
    orderNumber: 'INV-2024-002',
    customerEmail: 'jane.doe@example.com',
    customerName: 'Jane Doe',
    description: 'Standard Product'
  };

  try {
    const declinedResult = await paymentService.processPayment(declinedPaymentRequest);
    
    if (!declinedResult.success) {
      console.log('✅ Correctly handled declined payment');
      console.log(`   Error: ${declinedResult.error}`);
      console.log(`   Status: ${declinedResult.paymentStatus}`);
    } else {
      console.log('❌ Unexpected: Payment should have been declined');
    }
    
  } catch (error) {
    console.error('❌ Error processing declined payment:', error);
  }

  // Example 4: Partial Refund
  console.log('\n4. Testing partial refund...');
  
  const partialPaymentRequest = {
    amount: 200.00,
    currency: 'USD',
    paymentMethod: PAYMENT_METHOD.CREDIT_CARD,
    paymentData: {
      cardNumber: '5555555555554444', // Test Mastercard
      expiryMonth: '12',
      expiryYear: '2025',
      cvv: '123',
      cardholderName: 'Bob Johnson',
      billingAddress: {
        addressLine1: '789 Pine Street',
        city: 'Chicago',
        state: 'IL',
        postalCode: '60601',
        country: 'USA'
      }
    },
    orderId: 'order-2024-003',
    orderNumber: 'INV-2024-003',
    customerEmail: 'bob.johnson@example.com',
    customerName: 'Bob Johnson',
    description: 'Multiple Items Order'
  };

  try {
    const partialPaymentResult = await paymentService.processPayment(partialPaymentRequest);
    
    if (partialPaymentResult.success) {
      console.log('✅ Partial payment successful!');
      console.log(`   Transaction ID: ${partialPaymentResult.transactionId}`);
      
      // Process partial refund
      const partialRefundRequest = {
        transactionId: partialPaymentResult.transactionId!,
        amount: 50.00, // Partial refund
        reason: 'Returned one item',
        orderId: 'order-2024-003'
      };
      
      const partialRefundResult = await paymentService.refundPayment(partialRefundRequest);
      
      if (partialRefundResult.success) {
        console.log('✅ Partial refund successful!');
        console.log(`   Refund ID: ${partialRefundResult.refundId}`);
        console.log(`   Refund Amount: $${partialRefundRequest.amount}`);
        console.log(`   Remaining Amount: $${partialPaymentRequest.amount - partialRefundRequest.amount}`);
      } else {
        console.log('❌ Partial refund failed:', partialRefundResult.error);
      }
      
    } else {
      console.log('❌ Partial payment failed:', partialPaymentResult.error);
    }
    
  } catch (error) {
    console.error('❌ Error processing partial payment:', error);
  }

  console.log('\n=== Payment Flow Example Completed ===');
}

// Example: Integration with Order Management
async function orderManagementExample() {
  console.log('\n=== Order Management Integration Example ===\n');

  const paymentService = new PaymentService();

  // Simulate order creation
  const order = {
    id: 'order-123',
    orderNumber: 'INV-123',
    customerEmail: 'customer@example.com',
    customerName: 'Customer Name',
    totalAmount: 299.99,
    items: [
      { name: 'Product A', price: 199.99, quantity: 1 },
      { name: 'Product B', price: 100.00, quantity: 1 }
    ]
  };

  console.log('Processing order:', order.orderNumber);
  console.log('Total amount: $' + order.totalAmount);

  // Process payment
  const paymentRequest = {
    amount: order.totalAmount,
    currency: 'USD',
    paymentMethod: PAYMENT_METHOD.CREDIT_CARD,
    paymentData: {
      cardNumber: '4242424242424242',
      expiryMonth: '12',
      expiryYear: '2025',
      cvv: '123',
      cardholderName: order.customerName,
      billingAddress: {
        addressLine1: '123 Customer St',
        city: 'Customer City',
        state: 'CA',
        postalCode: '90210',
        country: 'USA'
      }
    },
    orderId: order.id,
    orderNumber: order.orderNumber,
    customerEmail: order.customerEmail,
    customerName: order.customerName,
    description: `Order ${order.orderNumber} - ${order.items.length} items`
  };

  try {
    const paymentResult = await paymentService.processPayment(paymentRequest);
    
    if (paymentResult.success) {
      console.log('✅ Order payment successful!');
      console.log(`   Order ID: ${order.id}`);
      console.log(`   Transaction ID: ${paymentResult.transactionId}`);
      console.log(`   Payment Status: ${paymentResult.paymentStatus}`);
      
      // Update order status in database (simulated)
      console.log('   Updating order status to "PAID"...');
      console.log('   Sending confirmation email...');
      console.log('   Generating invoice...');
      
    } else {
      console.log('❌ Order payment failed:', paymentResult.error);
      console.log('   Order status remains "PENDING"');
      console.log('   Sending payment failure notification...');
    }
    
  } catch (error) {
    console.error('❌ Order processing error:', error);
  }
}

// Run examples
async function runExamples() {
  try {
    await ecommercePaymentExample();
    await orderManagementExample();
    
    console.log('\n🎉 All examples completed successfully!');
    console.log('\nTo test with real Authorize.net credentials:');
    console.log('1. Set up your .env file with Authorize.net credentials');
    console.log('2. Update the environment to "production" when ready');
    console.log('3. Use real card numbers for live testing');
    
  } catch (error) {
    console.error('❌ Example execution failed:', error);
  }
}

// Run the examples
runExamples().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('❌ Examples failed:', error);
  process.exit(1);
}); 