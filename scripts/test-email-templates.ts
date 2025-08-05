import { EmailService } from '../src/common/services/email.service';
import { Order } from '../src/modules/checkout/entities/order.entity';
import { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHOD } from '../src/modules/checkout/entities/order.enums';
import fs from 'fs';
import path from 'path';

// Mock data for testing email templates
const mockOrder: Partial<Order> = {
  id: 'order_123',
  orderNumber: 'ORD-2024-001',
  createdAt: new Date(),
  subtotal: 299.99,
  taxAmount: 24.99,
  shippingAmount: 9.99,
  discountAmount: 25.00,
  totalAmount: 309.97,
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
  order: mockOrder as Order,
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
      totalPrice: 199.99,
      productImage: 'https://example.com/headphones.jpg'
    },
    {
      productName: 'Bluetooth Speaker',
      sku: 'BS-002',
      quantity: 2,
      unitPrice: 49.99,
      totalPrice: 99.98,
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
  estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
  invoiceUrl: 'https://cannbe.com/invoices/ORD-2024-001'
};

async function testEmailTemplates() {
  try {
    console.log('🧪 Testing email templates...');
    
    const emailService = new EmailService();
    
    // Generate order confirmation email
    console.log('📧 Generating order confirmation email...');
    const confirmationEmail = emailService['generateOrderConfirmationEmail'](mockEmailData);
    
    // Generate order shipped email
    console.log('📧 Generating order shipped email...');
    const shippedEmail = emailService['generateOrderShippedEmail'](mockEmailData);
    
    // Create output directory
    const outputDir = path.join(__dirname, '../email-previews');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Save email templates as HTML files
    fs.writeFileSync(
      path.join(outputDir, 'order-confirmation.html'),
      confirmationEmail
    );
    
    fs.writeFileSync(
      path.join(outputDir, 'order-shipped.html'),
      shippedEmail
    );
    
    console.log('✅ Email templates generated successfully!');
    console.log(`📁 Files saved to: ${outputDir}`);
    console.log('   - order-confirmation.html');
    console.log('   - order-shipped.html');
    console.log('\n🌐 You can open these files in your browser to preview the emails.');
    
    // Also create a simple preview page
    const previewPage = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Template Previews - CannBE</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
          }
          h1 {
            color: #333;
            text-align: center;
            margin-bottom: 30px;
          }
          .email-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
          }
          .email-preview {
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .email-preview h2 {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            margin: 0;
            padding: 20px;
            text-align: center;
          }
          .email-preview iframe {
            width: 100%;
            height: 600px;
            border: none;
          }
          @media (max-width: 768px) {
            .email-grid {
              grid-template-columns: 1fr;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📧 CannBE Email Template Previews</h1>
          <div class="email-grid">
            <div class="email-preview">
              <h2>Order Confirmation Email</h2>
              <iframe src="order-confirmation.html"></iframe>
            </div>
            <div class="email-preview">
              <h2>Order Shipped Email</h2>
              <iframe src="order-shipped.html"></iframe>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    fs.writeFileSync(
      path.join(outputDir, 'preview.html'),
      previewPage
    );
    
    console.log('   - preview.html (combined preview page)');
    console.log('\n🎉 All email templates are ready for review!');
    
  } catch (error) {
    console.error('❌ Error testing email templates:', error);
  }
}

// Run the test
testEmailTemplates(); 