import { DataSource } from 'typeorm';
import { config } from '../src/config/typeorm.config';
import { CheckoutService } from '../src/modules/checkout/checkout.service';
import { CartService } from '../src/modules/cart/cart.service';
import { ProductService } from '../src/modules/products/product.service';
import { UserService } from '../src/modules/user/user.service';
import { PaymentService } from '../src/common/services/payment.service';
import { PAYMENT_METHOD } from '../src/modules/checkout/entities/order.entity';

async function debugPaymentAmount() {
  console.log('🔍 Debugging payment amount discrepancy...\n');

  let dataSource: DataSource;
  
  try {
    // Initialize database connection
    dataSource = new DataSource(config);
    await dataSource.initialize();
    console.log('✅ Database connected');

    // Initialize services
    const checkoutService = new CheckoutService(dataSource);
    const cartService = new CartService(dataSource);
    const productService = new ProductService(dataSource);
    const userService = new UserService(dataSource);
    const paymentService = new PaymentService();

    // 1. Check available products
    console.log('1. Checking available products...');
    const products = await productService.findAll(1, 10);
    if (!products.data || products.data.length === 0) {
      console.log('❌ No products found');
      return;
    }
    
    const product = products.data[0];
    console.log(`✅ Found product: ${product.name} (ID: ${product.id})`);
    console.log(`   Price: $${product.price}\n`);

    // 2. Add item to cart
    console.log('2. Adding item to cart...');
    const cartItems = await cartService.addToCart({
      productId: product.id,
      quantity: 3
    });
    console.log('✅ Cart items added successfully\n');

    // 3. Get shipping options
    console.log('3. Getting shipping options...');
    const shippingOptions = await checkoutService.getShippingOptions({
      items: cartItems.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        weight: product.weight || 0.5
      })),
      shippingAddress: {
        country: 'US',
        state: 'CA',
        city: 'Los Angeles',
        postalCode: '90210'
      }
    });

    console.log('📦 Available Shipping Options:');
    shippingOptions.forEach((option, index) => {
      console.log(`   ${index + 1}. ${option.methodName} - $${option.totalCost}`);
    });

    if (shippingOptions.length === 0) {
      console.log('❌ No shipping options available');
      return;
    }

    const selectedShipping = shippingOptions[0];
    console.log(`4. Selected shipping method: ${selectedShipping.methodId} - $${selectedShipping.totalCost}\n`);

    // Calculate expected totals
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = selectedShipping.totalCost;
    const expectedTotal = subtotal + shippingCost;

    console.log('📊 Expected Totals:');
    console.log(`   Subtotal: $${subtotal.toFixed(2)}`);
    console.log(`   Shipping: $${shippingCost.toFixed(2)}`);
    console.log(`   Expected Total: $${expectedTotal.toFixed(2)}\n`);

    // 5. Test checkout initiation
    console.log('5. Testing checkout initiation...');
    const checkoutSession = await checkoutService.initiateCheckout({
      items: cartItems.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      shippingAddress: {
        country: 'US',
        state: 'CA',
        city: 'Los Angeles',
        postalCode: '90210'
      },
      shippingMethodId: selectedShipping.methodId
    });

    console.log('✅ Checkout initiated successfully\n');

    console.log('📊 Checkout Summary:');
    console.log(`   Subtotal: $${checkoutSession.summary.subtotal.toFixed(2)}`);
    console.log(`   Shipping Amount: $${checkoutSession.summary.shippingAmount.toFixed(2)}`);
    console.log(`   Tax Amount: $${checkoutSession.summary.taxAmount.toFixed(2)}`);
    console.log(`   Discount Amount: $${checkoutSession.summary.discountAmount.toFixed(2)}`);
    console.log(`   Total Amount: $${checkoutSession.summary.totalAmount.toFixed(2)}`);
    console.log(`   Item Count: ${checkoutSession.items.length}\n`);

    // Check for discrepancy
    const discrepancy = Math.abs(expectedTotal - checkoutSession.summary.totalAmount);
    console.log('🔍 Amount Analysis:');
    console.log(`   Expected Total: $${expectedTotal.toFixed(2)}`);
    console.log(`   Actual Total: $${checkoutSession.summary.totalAmount.toFixed(2)}`);
    console.log(`   Discrepancy: $${discrepancy.toFixed(2)}`);
    
    if (discrepancy > 0.01) {
      console.log('❌ Discrepancy detected in checkout initiation!');
    } else {
      console.log('✅ No discrepancy detected in checkout initiation.');
    }

    // 6. Test payment request creation (without actual payment)
    console.log('\n6. Testing payment request creation...');
    
    const paymentRequest = {
      amount: checkoutSession.summary.totalAmount,
      currency: 'USD',
      paymentMethod: PAYMENT_METHOD.CREDIT_CARD,
      paymentData: {
        cardNumber: '4111111111111111',
        expiryMonth: '12',
        expiryYear: '2025',
        cvv: '123',
        cardholderName: 'Test User',
        billingAddress: {
          addressLine1: '123 Test St',
          city: 'Los Angeles',
          state: 'CA',
          postalCode: '90210',
          country: 'US'
        }
      },
      orderId: checkoutSession.id,
      orderNumber: `TEST-${Date.now()}`,
      customerEmail: 'test@example.com',
      customerName: 'Test User',
      description: `Order ${checkoutSession.id}`
    };

    console.log('🔍 Payment Request Details:');
    console.log(`   Amount: $${paymentRequest.amount.toFixed(2)}`);
    console.log(`   Currency: ${paymentRequest.currency}`);
    console.log(`   Order ID: ${paymentRequest.orderId}`);
    console.log(`   Order Number: ${paymentRequest.orderNumber}`);

    // 7. Test actual payment processing (this will fail in sandbox, but we can see the request)
    console.log('\n7. Testing actual payment processing...');
    console.log('   Note: This will fail due to sandbox environment, but we can see the request details.');
    
    try {
      const paymentResponse = await paymentService.processPayment(paymentRequest);
      console.log('🔍 Payment Response:');
      console.log(`   Success: ${paymentResponse.success}`);
      console.log(`   Status: ${paymentResponse.paymentStatus}`);
      if (paymentResponse.transactionId) {
        console.log(`   Transaction ID: ${paymentResponse.transactionId}`);
      }
      if (paymentResponse.error) {
        console.log(`   Error: ${paymentResponse.error}`);
      }
    } catch (error) {
      console.log('🔍 Payment Processing Error:');
      console.log(`   Error: ${error.message}`);
    }

    // 8. Test confirm order (without actual payment)
    console.log('\n8. Testing confirm order (without actual payment)...');
    console.log('   Note: This will fail due to payment processing, but we can see the session data.');
    
    try {
      const orderData = {
        paymentMethod: PAYMENT_METHOD.CREDIT_CARD,
        paymentData: {
          cardNumber: '4111111111111111',
          expiryMonth: '12',
          expiryYear: '2025',
          cvv: '123',
          cardholderName: 'Test User',
          billingAddress: {
            addressLine1: '123 Test St',
            city: 'Los Angeles',
            state: 'CA',
            postalCode: '90210',
            country: 'US'
          }
        },
        billingAddress: {
          addressLine1: '123 Test St',
          city: 'Los Angeles',
          state: 'CA',
          postalCode: '90210',
          country: 'US'
        }
      };

      const order = await checkoutService.confirmOrder(checkoutSession.id, orderData);
      console.log('✅ Order confirmed successfully');
      console.log(`📊 Confirmed Order Summary:`);
      console.log(`   Total Amount: $${order.totalAmount.toFixed(2)}`);
    } catch (error) {
      console.log('🔍 Order Confirmation Error:');
      console.log(`   Error: ${error.message}`);
    }

    console.log('\n🎯 Debug Summary:');
    console.log('   - Check if the discrepancy occurs during checkout initiation');
    console.log('   - Check if the discrepancy occurs during session storage');
    console.log('   - Check if the discrepancy occurs during order confirmation');
    console.log('   - The payment amount should match the session.summary.totalAmount');
    console.log('   - If the discrepancy is $31.04 (426 - 394.96), check for additional fees or currency conversion');

  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    if (dataSource) {
      await dataSource.destroy();
    }
  }
}

debugPaymentAmount().catch(console.error); 