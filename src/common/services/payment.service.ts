import axios from 'axios';
import { paymentConfig } from '../../config/payment.config';
import { PAYMENT_METHOD, PAYMENT_STATUS } from '../../modules/checkout/entities/order.entity';

export interface PaymentRequest {
  amount: number;
  currency: string;
  paymentMethod: PAYMENT_METHOD;
  paymentData: {
    cardNumber?: string;
    expiryMonth?: string;
    expiryYear?: string;
    cvv?: string;
    cardholderName?: string;
    billingAddress?: any;
    token?: string;
    paymentMethodId?: string;
  };
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  description?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  paymentStatus: PAYMENT_STATUS;
  gatewayResponse?: any;
  error?: string;
  requiresAction?: boolean;
  actionUrl?: string;
}

export interface RefundRequest {
  transactionId: string;
  amount: number;
  reason?: string;
  orderId: string;
}

export interface RefundResponse {
  success: boolean;
  refundId?: string;
  error?: string;
}

export class PaymentService {
  private readonly authorizeNetApiUrl: string;

  constructor() {
    this.authorizeNetApiUrl = paymentConfig.authorizeNet.environment === 'production'
      ? 'https://api.authorize.net/xml/v1/request.api'
      : 'https://apitest.authorize.net/xml/v1/request.api';
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      switch (request.paymentMethod) {
        case PAYMENT_METHOD.CREDIT_CARD:
        case PAYMENT_METHOD.DEBIT_CARD:
          return await this.processAuthorizeNetPayment(request);
        case PAYMENT_METHOD.STRIPE:
          return await this.processStripePayment(request);
        case PAYMENT_METHOD.PAYPAL:
          return await this.processPayPalPayment(request);
        case PAYMENT_METHOD.CASH_ON_DELIVERY:
          return await this.processCashOnDelivery(request);
        default:
          throw new Error(`Unsupported payment method: ${request.paymentMethod}`);
      }
    } catch (error: any) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        paymentStatus: PAYMENT_STATUS.FAILED,
        error: error.message || 'Payment processing failed'
      };
    }
  }

  private async processAuthorizeNetPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const payload = {
        createTransactionRequest: {
          merchantAuthentication: {
            name: paymentConfig.authorizeNet.apiLoginId,
            transactionKey: paymentConfig.authorizeNet.transactionKey
          },
          refId: request.orderNumber,
          transactionRequest: {
            transactionType: 'authCaptureTransaction',
            amount: request.amount.toFixed(2),
            currencyCode: request.currency,
            payment: {
              creditCard: {
                cardNumber: request.paymentData.cardNumber,
                expirationDate: `${request.paymentData.expiryMonth}/${request.paymentData.expiryYear}`,
                cardCode: request.paymentData.cvv
              }
            },
            billTo: {
              firstName: request.customerName.split(' ')[0],
              lastName: request.customerName.split(' ').slice(1).join(' '),
              email: request.customerEmail,
              address: request.paymentData.billingAddress?.addressLine1 || '',
              city: request.paymentData.billingAddress?.city || '',
              state: request.paymentData.billingAddress?.state || '',
              zip: request.paymentData.billingAddress?.postalCode || '',
              country: request.paymentData.billingAddress?.country || ''
            },
            order: {
              invoiceNumber: request.orderNumber,
              description: request.description || `Order ${request.orderNumber}`
            },
            customer: {
              email: request.customerEmail
            },
            transactionSettings: {
              setting: [
                {
                  settingName: 'emailCustomer',
                  settingValue: 'true'
                },
                {
                  settingName: 'merchantEmail',
                  settingValue: paymentConfig.email.from
                }
              ]
            }
          }
        }
      };

      const response = await axios.post(this.authorizeNetApiUrl, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = response.data.createTransactionResponse;

      if (result.responseCode === '1') {
        return {
          success: true,
          transactionId: result.transResponse.transId,
          paymentStatus: PAYMENT_STATUS.CAPTURED,
          gatewayResponse: result
        };
      } else {
        return {
          success: false,
          paymentStatus: PAYMENT_STATUS.FAILED,
          error: result.messages?.message?.[0]?.text || 'Payment failed',
          gatewayResponse: result
        };
      }
    } catch (error: any) {
      console.error('Authorize.net payment error:', error);
      return {
        success: false,
        paymentStatus: PAYMENT_STATUS.FAILED,
        error: error.response?.data?.messages?.message?.[0]?.text || error.message
      };
    }
  }

  private async processStripePayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const stripe = require('stripe')(paymentConfig.stripe.secretKey);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(request.amount * 100), // Convert to cents
        currency: request.currency.toLowerCase(),
        payment_method: request.paymentData.paymentMethodId,
        confirm: true,
        return_url: `${process.env.FRONTEND_URL}/payment/confirm`,
        metadata: {
          orderId: request.orderId,
          orderNumber: request.orderNumber,
          customerEmail: request.customerEmail
        }
      });

      if (paymentIntent.status === 'succeeded') {
        return {
          success: true,
          transactionId: paymentIntent.id,
          paymentStatus: PAYMENT_STATUS.CAPTURED,
          gatewayResponse: paymentIntent
        };
      } else if (paymentIntent.status === 'requires_action') {
        return {
          success: false,
          paymentStatus: PAYMENT_STATUS.PENDING,
          requiresAction: true,
          actionUrl: paymentIntent.next_action?.redirect_to_url?.url,
          gatewayResponse: paymentIntent
        };
      } else {
        return {
          success: false,
          paymentStatus: PAYMENT_STATUS.FAILED,
          error: paymentIntent.last_payment_error?.message || 'Payment failed',
          gatewayResponse: paymentIntent
        };
      }
    } catch (error: any) {
      console.error('Stripe payment error:', error);
      return {
        success: false,
        paymentStatus: PAYMENT_STATUS.FAILED,
        error: error.message
      };
    }
  }

  private async processPayPalPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // PayPal integration would go here
      // This is a placeholder for PayPal implementation
      return {
        success: false,
        paymentStatus: PAYMENT_STATUS.FAILED,
        error: 'PayPal integration not implemented yet'
      };
    } catch (error: any) {
      console.error('PayPal payment error:', error);
      return {
        success: false,
        paymentStatus: PAYMENT_STATUS.FAILED,
        error: error.message
      };
    }
  }

  private async processCashOnDelivery(request: PaymentRequest): Promise<PaymentResponse> {
    // Cash on delivery doesn't require payment processing
    return {
      success: true,
      paymentStatus: PAYMENT_STATUS.PENDING,
      gatewayResponse: {
        method: 'cash_on_delivery',
        status: 'pending_confirmation'
      }
    };
  }

  async refundPayment(refundRequest: RefundRequest): Promise<RefundResponse> {
    try {
      // For Authorize.net refunds
      const payload = {
        createTransactionRequest: {
          merchantAuthentication: {
            name: paymentConfig.authorizeNet.apiLoginId,
            transactionKey: paymentConfig.authorizeNet.transactionKey
          },
          refId: `refund_${refundRequest.orderId}`,
          transactionRequest: {
            transactionType: 'refundTransaction',
            amount: refundRequest.amount.toFixed(2),
            refTransId: refundRequest.transactionId
          }
        }
      };

      const response = await axios.post(this.authorizeNetApiUrl, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = response.data.createTransactionResponse;

      if (result.responseCode === '1') {
        return {
          success: true,
          refundId: result.transResponse.transId
        };
      } else {
        return {
          success: false,
          error: result.messages?.message?.[0]?.text || 'Refund failed'
        };
      }
    } catch (error: any) {
      console.error('Refund error:', error);
      return {
        success: false,
        error: error.message || 'Refund processing failed'
      };
    }
  }

  async verifyWebhook(payload: any, signature: string, gateway: 'authorizeNet' | 'stripe'): Promise<boolean> {
    try {
      if (gateway === 'authorizeNet') {
        // Authorize.net webhook verification
        const crypto = require('crypto');
        const expectedSignature = crypto
          .createHmac('sha512', paymentConfig.authorizeNet.signatureKey)
          .update(JSON.stringify(payload))
          .digest('hex');
        
        return crypto.timingSafeEqual(
          Buffer.from(signature, 'hex'),
          Buffer.from(expectedSignature, 'hex')
        );
      } else if (gateway === 'stripe') {
        // Stripe webhook verification
        const stripe = require('stripe')(paymentConfig.stripe.secretKey);
        const event = stripe.webhooks.constructEvent(
          payload,
          signature,
          paymentConfig.stripe.webhookSecret
        );
        return !!event;
      }
      return false;
    } catch (error) {
      console.error('Webhook verification error:', error);
      return false;
    }
  }

  async getPaymentStatus(transactionId: string, gateway: 'authorizeNet' | 'stripe'): Promise<PAYMENT_STATUS> {
    try {
      if (gateway === 'authorizeNet') {
        const payload = {
          getTransactionDetailsRequest: {
            merchantAuthentication: {
              name: paymentConfig.authorizeNet.apiLoginId,
              transactionKey: paymentConfig.authorizeNet.transactionKey
            },
            transId: transactionId
          }
        };

        const response = await axios.post(this.authorizeNetApiUrl, payload, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const result = response.data.getTransactionDetailsResponse;
        
        if (result.responseCode === '1') {
          const transaction = result.transaction;
          switch (transaction.transactionStatus) {
            case 'authorizedPendingCapture':
              return PAYMENT_STATUS.AUTHORIZED;
            case 'capturedPendingSettlement':
            case 'settledSuccessfully':
              return PAYMENT_STATUS.CAPTURED;
            case 'declined':
              return PAYMENT_STATUS.FAILED;
            case 'refundSettledSuccessfully':
              return PAYMENT_STATUS.REFUNDED;
            default:
              return PAYMENT_STATUS.PENDING;
          }
        }
      }
      
      return PAYMENT_STATUS.PENDING;
    } catch (error) {
      console.error('Get payment status error:', error);
      return PAYMENT_STATUS.PENDING;
    }
  }
}

export const paymentService = new PaymentService(); 