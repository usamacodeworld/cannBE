import axios from "axios";
const ApiContracts = require("authorizenet").APIContracts;
const ApiControllers = require("authorizenet").APIControllers;
const SDKConstants = require("authorizenet").Constants;
import { paymentConfig } from "../../config/payment.config";
import {
  PAYMENT_METHOD,
  PAYMENT_STATUS,
} from "../../modules/checkout/entities/order.enums";

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
    this.authorizeNetApiUrl =
      paymentConfig.authorizeNet.environment === "production"
        ? "https://api.authorize.net/xml/v1/request.api"
        : "https://apitest.authorize.net/xml/v1/request.api";
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
          throw new Error(
            `Unsupported payment method: ${request.paymentMethod}`
          );
      }
    } catch (error: any) {
      console.error("Payment processing error:", error);
      return {
        success: false,
        paymentStatus: PAYMENT_STATUS.FAILED,
        error: error.message || "Payment processing failed",
      };
    }
  }

  private async processAuthorizeNetPayment(
    request: PaymentRequest
  ): Promise<PaymentResponse> {
    return new Promise((resolve) => {
      try {
        // Create merchant authentication
        const merchantAuthenticationType =
          new ApiContracts.MerchantAuthenticationType();
        merchantAuthenticationType.setName(
          paymentConfig.authorizeNet.apiLoginId
        );
        merchantAuthenticationType.setTransactionKey(
          paymentConfig.authorizeNet.transactionKey
        );

        // Create credit card
        const creditCard = new ApiContracts.CreditCardType();
        creditCard.setCardNumber(request.paymentData.cardNumber || "");
        creditCard.setExpirationDate(
          `${request.paymentData.expiryMonth}/${request.paymentData.expiryYear}`
        );
        creditCard.setCardCode(request.paymentData.cvv || "");

        // Create payment type
        const paymentType = new ApiContracts.PaymentType();
        paymentType.setCreditCard(creditCard);

        // Create order details
        const orderDetails = new ApiContracts.OrderType();
        orderDetails.setInvoiceNumber(request.orderNumber);
        orderDetails.setDescription(
          request.description || `Order ${request.orderNumber}`
        );

        // Create billing address
        const billTo = new ApiContracts.CustomerAddressType();
        const nameParts = request.customerName.split(" ");
        billTo.setFirstName(nameParts[0] || "");
        billTo.setLastName(nameParts.slice(1).join(" ") || "");
        billTo.setAddress(
          request.paymentData.billingAddress?.addressLine1 || ""
        );
        billTo.setCity(request.paymentData.billingAddress?.city || "");
        billTo.setState(request.paymentData.billingAddress?.state || "");
        billTo.setZip(request.paymentData.billingAddress?.postalCode || "");
        billTo.setCountry(request.paymentData.billingAddress?.country || "");

        // Create transaction settings
        const transactionSetting1 = new ApiContracts.SettingType();
        transactionSetting1.setSettingName("duplicateWindow");
        transactionSetting1.setSettingValue("120");

        const transactionSetting2 = new ApiContracts.SettingType();
        transactionSetting2.setSettingName("emailCustomer");
        transactionSetting2.setSettingValue("true");

        const transactionSetting3 = new ApiContracts.SettingType();
        transactionSetting3.setSettingName("merchantEmail");
        transactionSetting3.setSettingValue(paymentConfig.email.from);

        const transactionSettingList = [];
        transactionSettingList.push(transactionSetting1);
        transactionSettingList.push(transactionSetting2);
        transactionSettingList.push(transactionSetting3);

        const transactionSettings = new ApiContracts.ArrayOfSetting();
        transactionSettings.setSetting(transactionSettingList);

        // Create customer data
        const customerData = new ApiContracts.CustomerDataType();
        customerData.setEmail(request.customerEmail);

        // Create transaction request
        const transactionRequestType =
          new ApiContracts.TransactionRequestType();
        transactionRequestType.setTransactionType(
          ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION
        );
        transactionRequestType.setPayment(paymentType);
        transactionRequestType.setAmount(request.amount.toFixed(2));
        transactionRequestType.setOrder(orderDetails);
        transactionRequestType.setBillTo(billTo);
        transactionRequestType.setCustomer(customerData);
        transactionRequestType.setTransactionSettings(transactionSettings);

        // Create the request
        const createRequest = new ApiContracts.CreateTransactionRequest();
        createRequest.setMerchantAuthentication(merchantAuthenticationType);
        createRequest.setTransactionRequest(transactionRequestType);

        // Create controller
        const ctrl = new ApiControllers.CreateTransactionController(
          createRequest.getJSON()
        );

        // Set environment based on config
        if (paymentConfig.authorizeNet.environment === "production") {
          ctrl.setEnvironment(SDKConstants.endpoint.production);
        } else {
          ctrl.setEnvironment(SDKConstants.endpoint.sandbox);
        }

        // Execute the transaction
        ctrl.execute(function () {
          const apiResponse = ctrl.getResponse();
          let response: any = null;

          if (apiResponse != null) {
            response = new ApiContracts.CreateTransactionResponse(apiResponse);
          }

          if (response != null) {
            if (
              response.getMessages().getResultCode() ==
              ApiContracts.MessageTypeEnum.OK
            ) {
              if (response.getTransactionResponse().getMessages() != null) {
                resolve({
                  success: true,
                  transactionId: response.getTransactionResponse().getTransId(),
                  paymentStatus: PAYMENT_STATUS.CAPTURED,
                  gatewayResponse: response,
                });
              } else {
                // Failed transaction
                const errorMessage =
                  response.getTransactionResponse().getErrors() != null
                    ? response
                        .getTransactionResponse()
                        .getErrors()
                        .getError()[0]
                        .getErrorText()
                    : "Payment failed";

                resolve({
                  success: false,
                  paymentStatus: PAYMENT_STATUS.FAILED,
                  error: errorMessage,
                  gatewayResponse: response,
                });
              }
            } else {
              // Failed transaction
              let errorMessage = "Payment failed";
              if (
                response.getTransactionResponse() != null &&
                response.getTransactionResponse().getErrors() != null
              ) {
                errorMessage = response
                  .getTransactionResponse()
                  .getErrors()
                  .getError()[0]
                  .getErrorText();
              } else {
                errorMessage = response.getMessages().getMessage()[0].getText();
              }

              resolve({
                success: false,
                paymentStatus: PAYMENT_STATUS.FAILED,
                error: errorMessage,
                gatewayResponse: response,
              });
            }
          } else {
            const apiError = ctrl.getError();
            console.error("Authorize.net API Error:", apiError);
            resolve({
              success: false,
              paymentStatus: PAYMENT_STATUS.FAILED,
              error: "Null response from payment gateway",
            });
          }
        });
      } catch (error: any) {
        console.error("Authorize.net payment error:", error);
        resolve({
          success: false,
          paymentStatus: PAYMENT_STATUS.FAILED,
          error: error.message || "Payment processing failed",
        });
      }
    });
  }

  private async processStripePayment(
    request: PaymentRequest
  ): Promise<PaymentResponse> {
    try {
      const stripe = require("stripe")(paymentConfig.stripe.secretKey);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(request.amount * 100), // Convert to cents
        currency: request.currency.toLowerCase(),
        payment_method: request.paymentData.paymentMethodId,
        confirm: true,
        return_url: `${process.env.FRONTEND_URL}/payment/confirm`,
        metadata: {
          orderId: request.orderId,
          orderNumber: request.orderNumber,
          customerEmail: request.customerEmail,
        },
      });

      if (paymentIntent.status === "succeeded") {
        return {
          success: true,
          transactionId: paymentIntent.id,
          paymentStatus: PAYMENT_STATUS.CAPTURED,
          gatewayResponse: paymentIntent,
        };
      } else if (paymentIntent.status === "requires_action") {
        return {
          success: false,
          paymentStatus: PAYMENT_STATUS.PENDING,
          requiresAction: true,
          actionUrl: paymentIntent.next_action?.redirect_to_url?.url,
          gatewayResponse: paymentIntent,
        };
      } else {
        return {
          success: false,
          paymentStatus: PAYMENT_STATUS.FAILED,
          error: paymentIntent.last_payment_error?.message || "Payment failed",
          gatewayResponse: paymentIntent,
        };
      }
    } catch (error: any) {
      console.error("Stripe payment error:", error);
      return {
        success: false,
        paymentStatus: PAYMENT_STATUS.FAILED,
        error: error.message,
      };
    }
  }

  private async processPayPalPayment(
    request: PaymentRequest
  ): Promise<PaymentResponse> {
    try {
      // PayPal integration would go here
      // This is a placeholder for PayPal implementation
      return {
        success: false,
        paymentStatus: PAYMENT_STATUS.FAILED,
        error: "PayPal integration not implemented yet",
      };
    } catch (error: any) {
      console.error("PayPal payment error:", error);
      return {
        success: false,
        paymentStatus: PAYMENT_STATUS.FAILED,
        error: error.message,
      };
    }
  }

  private async processCashOnDelivery(
    request: PaymentRequest
  ): Promise<PaymentResponse> {
    // Cash on delivery doesn't require payment processing
    return {
      success: true,
      paymentStatus: PAYMENT_STATUS.PENDING,
      gatewayResponse: {
        method: "cash_on_delivery",
        status: "pending_confirmation",
      },
    };
  }

  async refundPayment(refundRequest: RefundRequest): Promise<RefundResponse> {
    return new Promise((resolve) => {
      try {
        // Create merchant authentication
        const merchantAuthenticationType =
          new ApiContracts.MerchantAuthenticationType();
        merchantAuthenticationType.setName(
          paymentConfig.authorizeNet.apiLoginId
        );
        merchantAuthenticationType.setTransactionKey(
          paymentConfig.authorizeNet.transactionKey
        );

        // Create payment type for refund
        const paymentType = new ApiContracts.PaymentType();
        // For refunds, we don't need credit card details as we're refunding to the original payment method

        // Create transaction request for refund
        const transactionRequestType =
          new ApiContracts.TransactionRequestType();
        transactionRequestType.setTransactionType(
          ApiContracts.TransactionTypeEnum.REFUNDTRANSACTION
        );
        transactionRequestType.setPayment(paymentType);
        transactionRequestType.setAmount(refundRequest.amount.toFixed(2));
        transactionRequestType.setRefTransId(refundRequest.transactionId);

        // Create the request
        const createRequest = new ApiContracts.CreateTransactionRequest();
        createRequest.setMerchantAuthentication(merchantAuthenticationType);
        createRequest.setTransactionRequest(transactionRequestType);

        // Create controller
        const ctrl = new ApiControllers.CreateTransactionController(
          createRequest.getJSON()
        );

        // Set environment based on config
        if (paymentConfig.authorizeNet.environment === "production") {
          ctrl.setEnvironment(SDKConstants.endpoint.production);
        } else {
          ctrl.setEnvironment(SDKConstants.endpoint.sandbox);
        }

        // Execute the refund
        ctrl.execute(function () {
          const apiResponse = ctrl.getResponse();
          let response: any = null;

          if (apiResponse != null) {
            response = new ApiContracts.CreateTransactionResponse(apiResponse);
          }

          if (response != null) {
            if (
              response.getMessages().getResultCode() ==
              ApiContracts.MessageTypeEnum.OK
            ) {
              if (response.getTransactionResponse().getMessages() != null) {
                resolve({
                  success: true,
                  refundId: response.getTransactionResponse().getTransId(),
                });
              } else {
                // Failed refund
                const errorMessage =
                  response.getTransactionResponse().getErrors() != null
                    ? response
                        .getTransactionResponse()
                        .getErrors()
                        .getError()[0]
                        .getErrorText()
                    : "Refund failed";

                resolve({
                  success: false,
                  error: errorMessage,
                });
              }
            } else {
              // Failed refund
              let errorMessage = "Refund failed";
              if (
                response.getTransactionResponse() != null &&
                response.getTransactionResponse().getErrors() != null
              ) {
                errorMessage = response
                  .getTransactionResponse()
                  .getErrors()
                  .getError()[0]
                  .getErrorText();
              } else {
                errorMessage = response.getMessages().getMessage()[0].getText();
              }

              resolve({
                success: false,
                error: errorMessage,
              });
            }
          } else {
            const apiError = ctrl.getError();
            console.error("Authorize.net Refund API Error:", apiError);
            resolve({
              success: false,
              error: "Null response from payment gateway",
            });
          }
        });
      } catch (error: any) {
        console.error("Refund error:", error);
        resolve({
          success: false,
          error: error.message || "Refund processing failed",
        });
      }
    });
  }

  async verifyWebhook(
    payload: any,
    signature: string,
    gateway: "authorizeNet" | "stripe"
  ): Promise<boolean> {
    try {
      if (gateway === "authorizeNet") {
        // Authorize.net webhook verification
        const crypto = require("crypto");
        const expectedSignature = crypto
          .createHmac("sha512", paymentConfig.authorizeNet.signatureKey)
          .update(JSON.stringify(payload))
          .digest("hex");

        return crypto.timingSafeEqual(
          Buffer.from(signature, "hex"),
          Buffer.from(expectedSignature, "hex")
        );
      } else if (gateway === "stripe") {
        // Stripe webhook verification
        const stripe = require("stripe")(paymentConfig.stripe.secretKey);
        const event = stripe.webhooks.constructEvent(
          payload,
          signature,
          paymentConfig.stripe.webhookSecret
        );
        return !!event;
      }
      return false;
    } catch (error) {
      console.error("Webhook verification error:", error);
      return false;
    }
  }

  async getPaymentStatus(
    transactionId: string,
    gateway: "authorizeNet" | "stripe"
  ): Promise<PAYMENT_STATUS> {
    try {
      if (gateway === "authorizeNet") {
        const payload = {
          getTransactionDetailsRequest: {
            merchantAuthentication: {
              name: paymentConfig.authorizeNet.apiLoginId,
              transactionKey: paymentConfig.authorizeNet.transactionKey,
            },
            transId: transactionId,
          },
        };

        const response = await axios.post(this.authorizeNetApiUrl, payload, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = response.data.getTransactionDetailsResponse;

        if (result.responseCode === "1") {
          const transaction = result.transaction;
          switch (transaction.transactionStatus) {
            case "authorizedPendingCapture":
              return PAYMENT_STATUS.AUTHORIZED;
            case "capturedPendingSettlement":
            case "settledSuccessfully":
              return PAYMENT_STATUS.CAPTURED;
            case "declined":
              return PAYMENT_STATUS.FAILED;
            case "refundSettledSuccessfully":
              return PAYMENT_STATUS.REFUNDED;
            default:
              return PAYMENT_STATUS.PENDING;
          }
        }
      }

      return PAYMENT_STATUS.PENDING;
    } catch (error) {
      console.error("Get payment status error:", error);
      return PAYMENT_STATUS.PENDING;
    }
  }
}

export const paymentService = new PaymentService();
