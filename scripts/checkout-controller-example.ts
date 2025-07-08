import { PaymentService } from '../src/common/services/payment.service';
import { PAYMENT_METHOD, PAYMENT_STATUS, ORDER_STATUS } from '../src/modules/checkout/entities/order.entity';

/**
 * Practical Example: Integrating Authorize.net with Checkout Controller
 * 
 * This example shows how to integrate Authorize.net payment processing
 * into your actual checkout controller endpoints.
 */

// Mock Express Request/Response for demonstration
interface MockRequest {
  body: any;
  user?: any;
  params: any;
}

interface MockResponse {
  status: (code: number) => MockResponse;
  json: (data: any) => void;
}

// Mock checkout controller with Authorize.net integration
class CheckoutControllerWithAuthorizeNet {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  // Example: POST /api/checkout/confirm-order
  async confirmOrder(req: MockRequest, res: MockResponse) {
    try {
      const user = req.user;
      const {
        checkoutId,
        customerInfo,
        paymentMethod,
        paymentData,
        couponCode,
        notes
      } = req.body;

      console.log('🛒 Processing order confirmation...');
      console.log(`   Customer: ${customerInfo.firstName} ${customerInfo.lastName}`);
      console.log(`   Payment Method: ${paymentMethod}`);
      console.log(`   Total Amount: $${this.calculateTotalAmount()}`);

      // Step 1: Validate checkout session
      const checkoutSession = await this.getCheckoutSession(checkoutId);
      if (!checkoutSession) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'CHECKOUT_SESSION_EXPIRED',
            message: 'Checkout session not found or expired'
          }
        });
      }

      // Step 2: Process payment with Authorize.net
      if (paymentMethod === PAYMENT_METHOD.CREDIT_CARD || paymentMethod === PAYMENT_METHOD.DEBIT_CARD) {
        console.log('💳 Processing payment with Authorize.net...');
        
        const paymentRequest = {
          amount: checkoutSession.totalAmount,
          currency: 'USD',
          paymentMethod: paymentMethod,
          paymentData: {
            cardNumber: paymentData.cardNumber,
            expiryMonth: paymentData.expiryMonth,
            expiryYear: paymentData.expiryYear,
            cvv: paymentData.cvv,
            cardholderName: paymentData.cardholderName,
            billingAddress: checkoutSession.billingAddress
          },
          orderId: checkoutSession.orderNumber,
          orderNumber: checkoutSession.orderNumber,
          customerEmail: customerInfo.email,
          customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
          description: `Order ${checkoutSession.orderNumber} - ${checkoutSession.items.length} items`
        };

        const paymentResult = await this.paymentService.processPayment(paymentRequest);

        if (!paymentResult.success && paymentResult.paymentStatus !== PAYMENT_STATUS.PENDING) {
          console.log('❌ Payment failed:', paymentResult.error);
          
          return res.status(400).json({
            success: false,
            error: {
              code: 'PAYMENT_FAILED',
              message: paymentResult.error || 'Payment processing failed',
              details: {
                paymentStatus: paymentResult.paymentStatus,
                requiresAction: paymentResult.requiresAction,
                actionUrl: paymentResult.actionUrl
              }
            }
          });
        }

        console.log('✅ Payment successful!');
        console.log(`   Transaction ID: ${paymentResult.transactionId}`);
        console.log(`   Payment Status: ${paymentResult.paymentStatus}`);

        // Step 3: Create order in database
        const order = await this.createOrder({
          userId: user?.id,
          guestId: user ? undefined : this.generateGuestId(),
          orderNumber: checkoutSession.orderNumber,
          customerInfo: customerInfo,
          items: checkoutSession.items,
          totals: {
            subtotal: checkoutSession.subtotal,
            taxAmount: checkoutSession.taxAmount,
            shippingAmount: checkoutSession.shippingAmount,
            discountAmount: checkoutSession.discountAmount,
            totalAmount: checkoutSession.totalAmount
          },
          paymentInfo: {
            method: paymentMethod,
            status: paymentResult.paymentStatus,
            transactionId: paymentResult.transactionId,
            gatewayResponse: paymentResult.gatewayResponse
          },
          addresses: {
            shipping: checkoutSession.shippingAddress,
            billing: checkoutSession.billingAddress
          },
          couponCode: couponCode,
          notes: notes
        });

        // Step 4: Update inventory and clear cart
        await this.updateInventory(checkoutSession.items);
        await this.clearCart(user?.id, order.guestId);

        // Step 5: Send confirmation email
        await this.sendOrderConfirmation(order, customerInfo);

        // Step 6: Return success response
        return res.status(201).json({
          success: true,
          data: {
            order: {
              id: order.id,
              orderNumber: order.orderNumber,
              status: order.status,
              paymentStatus: order.paymentStatus,
              totalAmount: order.totalAmount,
              transactionId: order.paymentTransactionId,
              estimatedDeliveryDate: this.calculateDeliveryDate()
            },
            paymentReceipt: {
              transactionId: order.paymentTransactionId,
              paymentMethod: order.paymentMethod,
              amount: order.totalAmount,
              currency: 'USD',
              status: order.paymentStatus
            }
          }
        });

      } else if (paymentMethod === PAYMENT_METHOD.CASH_ON_DELIVERY) {
        // Handle cash on delivery
        console.log('💵 Processing cash on delivery order...');
        
        const order = await this.createOrder({
          userId: user?.id,
          guestId: user ? undefined : this.generateGuestId(),
          orderNumber: checkoutSession.orderNumber,
          customerInfo: customerInfo,
          items: checkoutSession.items,
          totals: {
            subtotal: checkoutSession.subtotal,
            taxAmount: checkoutSession.taxAmount,
            shippingAmount: checkoutSession.shippingAmount,
            discountAmount: checkoutSession.discountAmount,
            totalAmount: checkoutSession.totalAmount
          },
          paymentInfo: {
            method: paymentMethod,
            status: PAYMENT_STATUS.PENDING,
            transactionId: null,
            gatewayResponse: null
          },
          addresses: {
            shipping: checkoutSession.shippingAddress,
            billing: checkoutSession.billingAddress
          },
          couponCode: couponCode,
          notes: notes
        });

        return res.status(201).json({
          success: true,
          data: {
            order: {
              id: order.id,
              orderNumber: order.orderNumber,
              status: order.status,
              paymentStatus: order.paymentStatus,
              totalAmount: order.totalAmount,
              estimatedDeliveryDate: this.calculateDeliveryDate()
            }
          }
        });

      } else {
        return res.status(400).json({
          success: false,
          error: {
            code: 'UNSUPPORTED_PAYMENT_METHOD',
            message: `Payment method ${paymentMethod} is not supported`
          }
        });
      }

    } catch (error: any) {
      console.error('❌ Order confirmation error:', error);
      
      return res.status(500).json({
        success: false,
        error: {
          code: 'ORDER_CONFIRMATION_FAILED',
          message: error.message || 'Order confirmation failed'
        }
      });
    }
  }

  // Example: POST /api/checkout/refund
  async processRefund(req: MockRequest, res: MockResponse) {
    try {
      const { orderId, amount, reason } = req.body;
      const user = req.user;

      console.log('🔄 Processing refund...');
      console.log(`   Order ID: ${orderId}`);
      console.log(`   Refund Amount: $${amount}`);

      // Step 1: Get order details
      const order = await this.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'ORDER_NOT_FOUND',
            message: 'Order not found'
          }
        });
      }

      // Step 2: Validate refund amount
      if (amount > order.totalAmount) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REFUND_AMOUNT',
            message: 'Refund amount cannot exceed order total'
          }
        });
      }

      // Step 3: Process refund with Authorize.net
      if (order.paymentMethod === PAYMENT_METHOD.CREDIT_CARD || order.paymentMethod === PAYMENT_METHOD.DEBIT_CARD) {
        const refundRequest = {
          transactionId: order.paymentTransactionId,
          amount: amount,
          reason: reason || 'Customer requested refund',
          orderId: order.id
        };

        const refundResult = await this.paymentService.refundPayment(refundRequest);

        if (refundResult.success) {
          console.log('✅ Refund successful!');
          console.log(`   Refund ID: ${refundResult.refundId}`);

          // Step 4: Update order status
          await this.updateOrderStatus(order.id, ORDER_STATUS.REFUNDED, PAYMENT_STATUS.REFUNDED);

          // Step 5: Send refund confirmation
          await this.sendRefundConfirmation(order, amount, refundResult.refundId);

          return res.status(200).json({
            success: true,
            data: {
              refundId: refundResult.refundId,
              amount: amount,
              status: 'refunded',
              orderStatus: ORDER_STATUS.REFUNDED
            }
          });
        } else {
          console.log('❌ Refund failed:', refundResult.error);
          
          return res.status(400).json({
            success: false,
            error: {
              code: 'REFUND_FAILED',
              message: refundResult.error || 'Refund processing failed'
            }
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          error: {
            code: 'REFUND_NOT_SUPPORTED',
            message: 'Refunds are not supported for this payment method'
          }
        });
      }

    } catch (error: any) {
      console.error('❌ Refund processing error:', error);
      
      return res.status(500).json({
        success: false,
        error: {
          code: 'REFUND_PROCESSING_FAILED',
          message: error.message || 'Refund processing failed'
        }
      });
    }
  }

  // Helper methods (simulated)
  private async getCheckoutSession(checkoutId: string) {
    // Simulate getting checkout session from cache/database
    return {
      orderNumber: 'INV-' + Date.now(),
      items: [
        { productId: 'prod-1', name: 'Product A', quantity: 2, unitPrice: 25.00 },
        { productId: 'prod-2', name: 'Product B', quantity: 1, unitPrice: 50.00 }
      ],
      subtotal: 100.00,
      taxAmount: 8.00,
      shippingAmount: 9.99,
      discountAmount: 0,
      totalAmount: 117.99,
      shippingAddress: {
        addressLine1: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA'
      },
      billingAddress: {
        addressLine1: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA'
      }
    };
  }

  private calculateTotalAmount() {
    return 117.99; // Simulated total
  }

  private async createOrder(orderData: any) {
    console.log('📝 Creating order in database...');
    return {
      id: 'order-' + Date.now(),
      orderNumber: orderData.orderNumber,
      status: ORDER_STATUS.PENDING,
      paymentStatus: orderData.paymentInfo.status,
      paymentMethod: orderData.paymentInfo.method,
      paymentTransactionId: orderData.paymentInfo.transactionId,
      totalAmount: orderData.totals.totalAmount,
      createdAt: new Date()
    };
  }

  private generateGuestId() {
    return 'guest-' + Date.now();
  }

  private async updateInventory(items: any[]) {
    console.log('📦 Updating inventory...');
  }

  private async clearCart(userId?: string, guestId?: string) {
    console.log('🛒 Clearing cart...');
  }

  private async sendOrderConfirmation(order: any, customerInfo: any) {
    console.log('📧 Sending order confirmation email...');
  }

  private calculateDeliveryDate() {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  }

  private async getOrderById(orderId: string) {
    // Simulate getting order from database
    return {
      id: orderId,
      totalAmount: 117.99,
      paymentMethod: PAYMENT_METHOD.CREDIT_CARD,
      paymentTransactionId: 'trans_' + Date.now()
    };
  }

  private async updateOrderStatus(orderId: string, status: ORDER_STATUS, paymentStatus: PAYMENT_STATUS) {
    console.log(`📝 Updating order ${orderId}: ${status}, ${paymentStatus}`);
  }

  private async sendRefundConfirmation(order: any, amount: number, refundId: string) {
    console.log('📧 Sending refund confirmation email...');
  }
}

// Example usage
async function demonstrateCheckoutController() {
  console.log('🎯 === Checkout Controller with Authorize.net Integration ===\n');

  const controller = new CheckoutControllerWithAuthorizeNet();

  // Example 1: Successful order confirmation
  console.log('1️⃣ Processing successful order confirmation...\n');

  const successfulOrderRequest: MockRequest = {
    body: {
      checkoutId: 'checkout-123',
      customerInfo: {
        email: 'customer@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '555-123-4567'
      },
      paymentMethod: PAYMENT_METHOD.CREDIT_CARD,
      paymentData: {
        cardNumber: '4242424242424242',
        expiryMonth: '12',
        expiryYear: '2025',
        cvv: '123',
        cardholderName: 'John Doe'
      },
      notes: 'Please deliver during business hours'
    },
    user: { id: 'user-123' },
    params: {}
  };

  const mockResponse: MockResponse = {
    status: (code: number) => {
      console.log(`   Response Status: ${code}`);
      return mockResponse;
    },
    json: (data: any) => {
      console.log('   Response Data:', JSON.stringify(data, null, 2));
    }
  };

  await controller.confirmOrder(successfulOrderRequest, mockResponse);

  // Example 2: Refund processing
  console.log('\n\n2️⃣ Processing refund...\n');

  const refundRequest: MockRequest = {
    body: {
      orderId: 'order-123',
      amount: 50.00,
      reason: 'Customer returned one item'
    },
    user: { id: 'user-123' },
    params: {}
  };

  await controller.processRefund(refundRequest, mockResponse);

  console.log('\n\n✅ Checkout controller examples completed!');
  console.log('\nKey Integration Points:');
  console.log('✅ Payment processing is integrated into order confirmation');
  console.log('✅ Refund processing is available for completed orders');
  console.log('✅ Error handling for failed payments');
  console.log('✅ Order status updates based on payment results');
  console.log('✅ Email notifications for all scenarios');
}

// Run the demonstration
demonstrateCheckoutController().then(() => {
  console.log('\n🎉 Checkout controller demonstration completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Demonstration failed:', error);
  process.exit(1);
}); 