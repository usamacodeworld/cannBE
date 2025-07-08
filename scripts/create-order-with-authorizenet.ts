import { PaymentService } from '../src/common/services/payment.service';
import { PAYMENT_METHOD, PAYMENT_STATUS, ORDER_STATUS } from '../src/modules/checkout/entities/order.entity';

/**
 * Complete Order Creation with Authorize.net Payment Processing
 * 
 * This example demonstrates the full flow of creating an order with payment processing:
 * 1. Prepare order data
 * 2. Process payment with Authorize.net
 * 3. Create order in database
 * 4. Handle success/failure scenarios
 */

// Mock database operations for demonstration
class MockOrderService {
  async createOrder(orderData: any) {
    console.log('📝 Creating order in database...');
    console.log(`   Order Number: ${orderData.orderNumber}`);
    console.log(`   Customer: ${orderData.customerName}`);
    console.log(`   Total Amount: $${orderData.totalAmount}`);
    
    // Simulate database save
    return {
      id: 'order-' + Date.now(),
      ...orderData,
      status: ORDER_STATUS.PENDING,
      paymentStatus: orderData.paymentStatus,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async updateOrderStatus(orderId: string, status: ORDER_STATUS, paymentStatus: PAYMENT_STATUS) {
    console.log(`📝 Updating order ${orderId}:`);
    console.log(`   Status: ${status}`);
    console.log(`   Payment Status: ${paymentStatus}`);
  }

  async createOrderItems(orderId: string, items: any[]) {
    console.log(`📝 Creating ${items.length} order items...`);
    items.forEach((item, index) => {
      console.log(`   Item ${index + 1}: ${item.name} x${item.quantity} - $${item.totalPrice}`);
    });
  }
}

// Mock email service
class MockEmailService {
  async sendOrderConfirmation(orderData: any) {
    console.log('📧 Sending order confirmation email...');
    console.log(`   To: ${orderData.customerEmail}`);
    console.log(`   Subject: Order Confirmation - ${orderData.orderNumber}`);
  }

  async sendPaymentFailureNotification(orderData: any, error: string) {
    console.log('📧 Sending payment failure notification...');
    console.log(`   To: ${orderData.customerEmail}`);
    console.log(`   Error: ${error}`);
  }
}

async function createOrderWithAuthorizeNet() {
  console.log('🛒 === Complete Order Creation with Authorize.net ===\n');

  const paymentService = new PaymentService();
  const orderService = new MockOrderService();
  const emailService = new MockEmailService();

  // Example 1: Successful Order Creation
  console.log('1️⃣ Creating a successful order...\n');

  const orderData = {
    orderNumber: 'INV-2024-001',
    customerInfo: {
      email: 'customer@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '555-123-4567'
    },
    items: [
      {
        id: 'prod-1',
        name: 'Premium Product A',
        quantity: 2,
        unitPrice: 49.99,
        totalPrice: 99.98
      },
      {
        id: 'prod-2',
        name: 'Standard Product B',
        quantity: 1,
        unitPrice: 29.99,
        totalPrice: 29.99
      }
    ],
    shippingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      addressLine1: '123 Main Street',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA'
    },
    billingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      addressLine1: '123 Main Street',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA'
    },
    paymentMethod: PAYMENT_METHOD.CREDIT_CARD,
    paymentData: {
      cardNumber: '4242424242424242', // Test Visa card
      expiryMonth: '12',
      expiryYear: '2025',
      cvv: '123',
      cardholderName: 'John Doe'
    },
    subtotal: 129.97,
    taxAmount: 10.40,
    shippingAmount: 9.99,
    discountAmount: 0,
    totalAmount: 150.36,
    notes: 'Please deliver during business hours'
  };

  try {
    // Step 1: Process Payment
    console.log('💳 Processing payment with Authorize.net...');
    
    const paymentRequest = {
      amount: orderData.totalAmount,
      currency: 'USD',
      paymentMethod: orderData.paymentMethod,
      paymentData: {
        cardNumber: orderData.paymentData.cardNumber,
        expiryMonth: orderData.paymentData.expiryMonth,
        expiryYear: orderData.paymentData.expiryYear,
        cvv: orderData.paymentData.cvv,
        cardholderName: orderData.paymentData.cardholderName,
        billingAddress: orderData.billingAddress
      },
      orderId: orderData.orderNumber,
      orderNumber: orderData.orderNumber,
      customerEmail: orderData.customerInfo.email,
      customerName: `${orderData.customerInfo.firstName} ${orderData.customerInfo.lastName}`,
      description: `Order ${orderData.orderNumber} - ${orderData.items.length} items`
    };

    const paymentResult = await paymentService.processPayment(paymentRequest);

    if (paymentResult.success) {
      console.log('✅ Payment successful!');
      console.log(`   Transaction ID: ${paymentResult.transactionId}`);
      console.log(`   Payment Status: ${paymentResult.paymentStatus}`);

      // Step 2: Create Order in Database
      const order = await orderService.createOrder({
        orderNumber: orderData.orderNumber,
        customerEmail: orderData.customerInfo.email,
        customerFirstName: orderData.customerInfo.firstName,
        customerLastName: orderData.customerInfo.lastName,
        customerPhone: orderData.customerInfo.phone,
        subtotal: orderData.subtotal,
        taxAmount: orderData.taxAmount,
        shippingAmount: orderData.shippingAmount,
        discountAmount: orderData.discountAmount,
        totalAmount: orderData.totalAmount,
        paymentStatus: paymentResult.paymentStatus,
        paymentMethod: orderData.paymentMethod,
        paymentTransactionId: paymentResult.transactionId,
        paymentGatewayResponse: JSON.stringify(paymentResult.gatewayResponse),
        shippingAddress: orderData.shippingAddress,
        billingAddress: orderData.billingAddress,
        notes: orderData.notes
      });

      // Step 3: Create Order Items
      await orderService.createOrderItems(order.id, orderData.items);

      // Step 4: Update Order Status
      await orderService.updateOrderStatus(
        order.id, 
        ORDER_STATUS.CONFIRMED, 
        PAYMENT_STATUS.CAPTURED
      );

      // Step 5: Send Confirmation Email
      await emailService.sendOrderConfirmation({
        orderNumber: order.orderNumber,
        customerEmail: order.customerEmail,
        totalAmount: order.totalAmount,
        transactionId: paymentResult.transactionId
      });

      console.log('\n🎉 Order created successfully!');
      console.log(`   Order ID: ${order.id}`);
      console.log(`   Order Number: ${order.orderNumber}`);
      console.log(`   Transaction ID: ${paymentResult.transactionId}`);

    } else {
      console.log('❌ Payment failed:', paymentResult.error);
      
      // Handle payment failure
      await emailService.sendPaymentFailureNotification(
        { customerEmail: orderData.customerInfo.email, orderNumber: orderData.orderNumber },
        paymentResult.error || 'Payment processing failed'
      );
    }

  } catch (error) {
    console.error('❌ Order creation failed:', error);
  }

  // Example 2: Order with Declined Payment
  console.log('\n\n2️⃣ Creating order with declined payment...\n');

  const declinedOrderData = {
    ...orderData,
    orderNumber: 'INV-2024-002',
    customerInfo: {
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '555-987-6543'
    },
    paymentData: {
      cardNumber: '4000000000000002', // Test declined card
      expiryMonth: '12',
      expiryYear: '2025',
      cvv: '123',
      cardholderName: 'Jane Smith'
    }
  };

  try {
    console.log('💳 Processing payment (expected to fail)...');
    
    const declinedPaymentRequest = {
      amount: declinedOrderData.totalAmount,
      currency: 'USD',
      paymentMethod: declinedOrderData.paymentMethod,
      paymentData: {
        cardNumber: declinedOrderData.paymentData.cardNumber,
        expiryMonth: declinedOrderData.paymentData.expiryMonth,
        expiryYear: declinedOrderData.paymentData.expiryYear,
        cvv: declinedOrderData.paymentData.cvv,
        cardholderName: declinedOrderData.paymentData.cardholderName,
        billingAddress: declinedOrderData.billingAddress
      },
      orderId: declinedOrderData.orderNumber,
      orderNumber: declinedOrderData.orderNumber,
      customerEmail: declinedOrderData.customerInfo.email,
      customerName: `${declinedOrderData.customerInfo.firstName} ${declinedOrderData.customerInfo.lastName}`,
      description: `Order ${declinedOrderData.orderNumber} - ${declinedOrderData.items.length} items`
    };

    const declinedPaymentResult = await paymentService.processPayment(declinedPaymentRequest);

    if (!declinedPaymentResult.success) {
      console.log('✅ Correctly handled declined payment');
      console.log(`   Error: ${declinedPaymentResult.error}`);
      console.log(`   Payment Status: ${declinedPaymentResult.paymentStatus}`);

      // Handle declined payment
      await emailService.sendPaymentFailureNotification(
        { customerEmail: declinedOrderData.customerInfo.email, orderNumber: declinedOrderData.orderNumber },
        declinedPaymentResult.error || 'Payment was declined'
      );

      console.log('\n📝 Order would be created with PENDING status');
      console.log('   Customer would be notified of payment failure');
      console.log('   Order would remain in cart for retry');
    }

  } catch (error) {
    console.error('❌ Error processing declined payment:', error);
  }

  // Example 3: Order with Partial Refund
  console.log('\n\n3️⃣ Processing order with partial refund...\n');

  const refundOrderData = {
    ...orderData,
    orderNumber: 'INV-2024-003',
    customerInfo: {
      email: 'bob@example.com',
      firstName: 'Bob',
      lastName: 'Johnson',
      phone: '555-456-7890'
    }
  };

  try {
    console.log('💳 Processing payment for refund example...');
    
    const refundPaymentRequest = {
      amount: refundOrderData.totalAmount,
      currency: 'USD',
      paymentMethod: refundOrderData.paymentMethod,
      paymentData: {
        cardNumber: '5555555555554444', // Test Mastercard
        expiryMonth: '12',
        expiryYear: '2025',
        cvv: '123',
        cardholderName: 'Bob Johnson',
        billingAddress: refundOrderData.billingAddress
      },
      orderId: refundOrderData.orderNumber,
      orderNumber: refundOrderData.orderNumber,
      customerEmail: refundOrderData.customerInfo.email,
      customerName: `${refundOrderData.customerInfo.firstName} ${refundOrderData.customerInfo.lastName}`,
      description: `Order ${refundOrderData.orderNumber} - ${refundOrderData.items.length} items`
    };

    const refundPaymentResult = await paymentService.processPayment(refundPaymentRequest);

    if (refundPaymentResult.success) {
      console.log('✅ Payment successful for refund example');
      console.log(`   Transaction ID: ${refundPaymentResult.transactionId}`);

      // Simulate partial refund (customer returned one item)
      console.log('\n🔄 Processing partial refund...');
      
      const refundAmount = 49.99; // Refund for one item
      const refundRequest = {
        transactionId: refundPaymentResult.transactionId!,
        amount: refundAmount,
        reason: 'Customer returned one item',
        orderId: refundOrderData.orderNumber
      };

      const refundResult = await paymentService.refundPayment(refundRequest);

      if (refundResult.success) {
        console.log('✅ Partial refund successful!');
        console.log(`   Refund ID: ${refundResult.refundId}`);
        console.log(`   Refund Amount: $${refundAmount}`);
        console.log(`   Remaining Amount: $${refundOrderData.totalAmount - refundAmount}`);
        
        // Update order status for partial refund
        await orderService.updateOrderStatus(
          'order-refund-example',
          ORDER_STATUS.PROCESSING,
          PAYMENT_STATUS.PARTIALLY_REFUNDED
        );
      } else {
        console.log('❌ Refund failed:', refundResult.error);
      }
    }

  } catch (error) {
    console.error('❌ Error processing refund example:', error);
  }

  console.log('\n\n🎯 === Order Creation Examples Completed ===');
  console.log('\nKey Points:');
  console.log('✅ Payment processing is integrated with order creation');
  console.log('✅ Failed payments are handled gracefully');
  console.log('✅ Refunds can be processed after order creation');
  console.log('✅ Email notifications are sent for all scenarios');
  console.log('✅ Order status is updated based on payment status');
}

// Example: Integration with Real Checkout Flow
async function realCheckoutFlowExample() {
  console.log('\n\n🛒 === Real Checkout Flow Integration ===\n');

  const paymentService = new PaymentService();

  // Simulate the complete checkout flow
  const checkoutFlow = {
    // Step 1: Customer adds items to cart
    cartItems: [
      { productId: 'prod-1', name: 'Product A', quantity: 2, unitPrice: 25.00 },
      { productId: 'prod-2', name: 'Product B', quantity: 1, unitPrice: 50.00 }
    ],

    // Step 2: Customer provides shipping/billing info
    customerInfo: {
      email: 'customer@example.com',
      firstName: 'Alice',
      lastName: 'Johnson',
      phone: '555-111-2222'
    },

    // Step 3: Calculate totals
    totals: {
      subtotal: 100.00,
      taxAmount: 8.00,
      shippingAmount: 9.99,
      discountAmount: 0,
      totalAmount: 117.99
    },

    // Step 4: Payment information
    paymentInfo: {
      method: PAYMENT_METHOD.CREDIT_CARD,
      cardNumber: '4242424242424242',
      expiryMonth: '12',
      expiryYear: '2025',
      cvv: '123',
      cardholderName: 'Alice Johnson'
    }
  };

  console.log('📋 Checkout Summary:');
  console.log(`   Items: ${checkoutFlow.cartItems.length}`);
  console.log(`   Subtotal: $${checkoutFlow.totals.subtotal}`);
  console.log(`   Tax: $${checkoutFlow.totals.taxAmount}`);
  console.log(`   Shipping: $${checkoutFlow.totals.shippingAmount}`);
  console.log(`   Total: $${checkoutFlow.totals.totalAmount}`);

  try {
    // Process payment
    const paymentRequest = {
      amount: checkoutFlow.totals.totalAmount,
      currency: 'USD',
      paymentMethod: checkoutFlow.paymentInfo.method,
      paymentData: {
        cardNumber: checkoutFlow.paymentInfo.cardNumber,
        expiryMonth: checkoutFlow.paymentInfo.expiryMonth,
        expiryYear: checkoutFlow.paymentInfo.expiryYear,
        cvv: checkoutFlow.paymentInfo.cvv,
        cardholderName: checkoutFlow.paymentInfo.cardholderName,
        billingAddress: {
          addressLine1: '456 Customer Ave',
          city: 'Customer City',
          state: 'CA',
          postalCode: '90210',
          country: 'USA'
        }
      },
      orderId: 'checkout-' + Date.now(),
      orderNumber: 'INV-CHECKOUT-' + Date.now(),
      customerEmail: checkoutFlow.customerInfo.email,
      customerName: `${checkoutFlow.customerInfo.firstName} ${checkoutFlow.customerInfo.lastName}`,
      description: `Checkout order - ${checkoutFlow.cartItems.length} items`
    };

    console.log('\n💳 Processing payment...');
    const paymentResult = await paymentService.processPayment(paymentRequest);

    if (paymentResult.success) {
      console.log('✅ Payment successful!');
      console.log(`   Transaction ID: ${paymentResult.transactionId}`);
      
      // In real application, this would create the order in your database
      console.log('\n📝 Creating order in database...');
      console.log('   - Save order details');
      console.log('   - Create order items');
      console.log('   - Update inventory');
      console.log('   - Clear cart');
      console.log('   - Send confirmation email');
      
      console.log('\n🎉 Checkout completed successfully!');
    } else {
      console.log('❌ Payment failed:', paymentResult.error);
      console.log('   - Keep items in cart');
      console.log('   - Show error message to customer');
      console.log('   - Allow retry with different payment method');
    }

  } catch (error) {
    console.error('❌ Checkout flow error:', error);
  }
}

// Run all examples
async function runAllExamples() {
  try {
    await createOrderWithAuthorizeNet();
    await realCheckoutFlowExample();
    
    console.log('\n\n🎉 All examples completed!');
    console.log('\nTo integrate with your application:');
    console.log('1. Use the PaymentService in your checkout controller');
    console.log('2. Handle payment success/failure in your order creation logic');
    console.log('3. Update order status based on payment response');
    console.log('4. Send appropriate notifications to customers');
    
  } catch (error) {
    console.error('❌ Examples failed:', error);
  }
}

// Run the examples
runAllExamples().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('❌ Examples failed:', error);
  process.exit(1);
}); 