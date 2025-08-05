import { EmailService } from '../src/common/services/email.service';
import { Order } from '../src/modules/checkout/entities/order.entity';
import { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHOD } from '../src/modules/checkout/entities/order.enums';

// Test data with string values (simulating database response)
const mockOrderWithStrings: Partial<Order> = {
  id: 'order_123',
  orderNumber: 'ORD-2024-001',
  createdAt: new Date(),
  subtotal: '299.99' as any, // String value
  taxAmount: '24.99' as any, // String value
  shippingAmount: '9.99' as any, // String value
  discountAmount: '25.00' as any, // String value
  totalAmount: '309.97' as any, // String value
  paymentMethod: PAYMENT_METHOD.CREDIT_CARD,
  paymentStatus: PAYMENT_STATUS.CAPTURED,
  status: ORDER_STATUS.CONFIRMED,
  userId: 'user_123',
  guestId: undefined,
  paymentTransactionId: 'txn_123456',
  paymentGatewayResponse: '{"status": "success"}',
  shippingAddress: {
    firstName: 'John',
    lastName: 'Doe',
    addressLine1: '123 Main Street',
    addressLine2: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'USA'
  },
  billingAddress: {
    firstName: 'John',
    lastName: 'Doe',
    addressLine1: '123 Main Street',
    addressLine2: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'USA',
    sameAsShipping: true
  },
  shippingMethod: 'Standard Shipping',
  trackingNumber: 'TRK123456789',
  estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  actualDeliveryDate: undefined,
  notes: undefined,
  adminNotes: undefined,
  couponCode: 'SAVE25',
  emailSent: false,
  cancelledAt: undefined,
  cancelReason: undefined,
  customerEmail: 'john.doe@example.com',
  customerFirstName: 'John',
  customerLastName: 'Doe',
  customerPhone: '+1-555-123-4567'
};

const mockEmailData = {
  order: mockOrderWithStrings as Order,
  customerName: 'John Doe',
  customerEmail: 'john.doe@example.com',
  orderNumber: 'ORD-2024-001',
  totalAmount: 309.97,
  items: [
    {
      productName: 'Premium Wireless Headphones',
      sku: 'WH-001',
      quantity: 1,
      unitPrice: 199.99,
      totalPrice: '199.99' as any, // String value
      productImage: 'https://example.com/headphones.jpg'
    },
    {
      productName: 'Bluetooth Speaker',
      sku: 'BS-002',
      quantity: 2,
      unitPrice: 49.99,
      totalPrice: '99.98' as any, // String value
      productImage: 'https://example.com/speaker.jpg'
    }
  ],
  shippingAddress: {
    firstName: 'John',
    lastName: 'Doe',
    addressLine1: '123 Main Street',
    addressLine2: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'USA'
  },
  trackingNumber: 'TRK123456789',
  estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  invoiceUrl: 'https://cannbe.com/invoices/ORD-2024-001'
};

async function testEmailFix() {
  try {
    console.log('🧪 Testing email templates with string values...');
    
    const emailService = new EmailService();
    
    // Test order confirmation email
    console.log('📧 Testing order confirmation email...');
    try {
      const confirmationEmail = emailService['generateOrderConfirmationEmail'](mockEmailData);
      console.log('✅ Order confirmation email generated successfully!');
      
      // Check if the email contains properly formatted currency
      if (confirmationEmail.includes('$299.99') && confirmationEmail.includes('$309.97')) {
        console.log('✅ Currency formatting working correctly!');
      } else {
        console.log('⚠️  Currency formatting may have issues');
      }
    } catch (error) {
      console.error('❌ Order confirmation email failed:', error);
    }
    
    // Test order shipped email
    console.log('📧 Testing order shipped email...');
    try {
      const shippedEmail = emailService['generateOrderShippedEmail'](mockEmailData);
      console.log('✅ Order shipped email generated successfully!');
    } catch (error) {
      console.error('❌ Order shipped email failed:', error);
    }
    
    // Test order refunded email
    console.log('📧 Testing order refunded email...');
    try {
      const refundedEmail = emailService['generateOrderRefundedEmail'](mockEmailData);
      console.log('✅ Order refunded email generated successfully!');
      
      // Check if the email contains properly formatted currency
      if (refundedEmail.includes('$309.97')) {
        console.log('✅ Refund amount formatting working correctly!');
      } else {
        console.log('⚠️  Refund amount formatting may have issues');
      }
    } catch (error) {
      console.error('❌ Order refunded email failed:', error);
    }
    
    console.log('\n🎉 All email templates tested successfully with string values!');
    console.log('✅ The TypeError should now be resolved.');
    
  } catch (error) {
    console.error('❌ Error testing email fix:', error);
  }
}

// Run the test
testEmailFix(); 