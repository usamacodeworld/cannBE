# Authorize.net Payment Integration

This document describes the Authorize.net payment integration implemented in the cannBE project.

## Overview

The Authorize.net integration uses the official Authorize.net Node.js SDK to process credit card payments and refunds. The integration is implemented in the `PaymentService` class and supports both sandbox and production environments.

## Features

- ✅ Credit card payment processing
- ✅ Payment refunds
- ✅ Sandbox and production environment support
- ✅ Comprehensive error handling
- ✅ Transaction logging
- ✅ Customer email notifications
- ✅ Duplicate transaction prevention

## Configuration

### Environment Variables

Add the following environment variables to your `.env` file:

```env
# Authorize.net Configuration
AUTHORIZE_NET_API_LOGIN_ID=your_api_login_id
AUTHORIZE_NET_TRANSACTION_KEY=your_transaction_key
AUTHORIZE_NET_SIGNATURE_KEY=your_signature_key
AUTHORIZE_NET_ENVIRONMENT=sandbox  # or 'production'
AUTHORIZE_NET_WEBHOOK_SECRET=your_webhook_secret

# Email Configuration (for payment notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
EMAIL_FROM=noreply@cannbe.com
```

### Getting Authorize.net Credentials

1. **Sandbox Account**: Sign up for a free Authorize.net sandbox account at [developer.authorize.net](https://developer.authorize.net/)
2. **API Login ID**: Found in your Authorize.net account under Account > Settings > API Credentials & Keys
3. **Transaction Key**: Generated in your Authorize.net account under Account > Settings > API Credentials & Keys
4. **Signature Key**: Used for webhook verification (optional for basic integration)

## Usage

### Processing a Payment

```typescript
import { PaymentService } from './src/common/services/payment.service';
import { PAYMENT_METHOD } from './src/modules/checkout/entities/order.entity';

const paymentService = new PaymentService();

const paymentRequest = {
  amount: 99.99,
  currency: 'USD',
  paymentMethod: PAYMENT_METHOD.CREDIT_CARD,
  paymentData: {
    cardNumber: '4242424242424242',
    expiryMonth: '12',
    expiryYear: '2025',
    cvv: '123',
    cardholderName: 'John Doe',
    billingAddress: {
      addressLine1: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA'
    }
  },
  orderId: 'order-123',
  orderNumber: 'INV-12345',
  customerEmail: 'customer@example.com',
  customerName: 'John Doe',
  description: 'Order payment'
};

const result = await paymentService.processPayment(paymentRequest);

if (result.success) {
  console.log('Payment successful:', result.transactionId);
} else {
  console.log('Payment failed:', result.error);
}
```

### Processing a Refund

```typescript
const refundRequest = {
  transactionId: 'original_transaction_id',
  amount: 99.99,
  reason: 'Customer requested refund',
  orderId: 'order-123'
};

const refundResult = await paymentService.refundPayment(refundRequest);

if (refundResult.success) {
  console.log('Refund successful:', refundResult.refundId);
} else {
  console.log('Refund failed:', refundResult.error);
}
```

## Test Cards

Use these test card numbers for sandbox testing:

| Card Type | Card Number | Expiry | CVV | Description |
|-----------|-------------|--------|-----|-------------|
| Visa | 4242424242424242 | Any future date | Any 3 digits | Successful payment |
| Visa (Declined) | 4000000000000002 | Any future date | Any 3 digits | Declined payment |
| Mastercard | 5555555555554444 | Any future date | Any 3 digits | Successful payment |
| American Express | 378282246310005 | Any future date | Any 4 digits | Successful payment |

## Error Handling

The integration includes comprehensive error handling for various scenarios:

- **Invalid card details**: Returns specific error messages
- **Insufficient funds**: Handles declined transactions
- **Network errors**: Retries and fallback handling
- **API errors**: Detailed error logging

## Security Features

1. **PCI Compliance**: Card data is not stored locally
2. **Environment Separation**: Sandbox and production environments are completely separate
3. **Transaction Logging**: All transactions are logged for audit purposes
4. **Duplicate Prevention**: Built-in duplicate transaction window (120 seconds)

## Testing

Run the test script to verify the integration:

```bash
yarn test:authorizenet
```

This will:
1. Process a test payment using a test card
2. Verify the payment was successful
3. Process a refund for the payment
4. Verify the refund was successful

## Webhook Integration

For production use, you can set up webhooks to receive real-time payment notifications:

```typescript
// Verify webhook signature
const isValid = await paymentService.verifyWebhook(payload, signature, 'authorizeNet');

if (isValid) {
  // Process webhook data
  console.log('Webhook verified successfully');
}
```

## Troubleshooting

### Common Issues

1. **"Invalid API Login ID"**: Check your API credentials in the Authorize.net account
2. **"Invalid Transaction Key"**: Regenerate your transaction key if needed
3. **"Test mode" errors**: Ensure you're using test cards in sandbox mode
4. **"Duplicate transaction"**: Wait 120 seconds between identical transactions

### Debug Mode

Enable debug logging by setting the environment variable:

```env
DEBUG=authorizenet
```

## Production Checklist

Before going live:

- [ ] Switch environment from `sandbox` to `production`
- [ ] Update API credentials to production values
- [ ] Test with real cards (small amounts)
- [ ] Set up webhook endpoints
- [ ] Configure email notifications
- [ ] Review security settings
- [ ] Set up monitoring and alerting

## Support

For Authorize.net specific issues:
- [Authorize.net Developer Documentation](https://developer.authorize.net/)
- [Authorize.net Support](https://support.authorize.net/)

For integration issues:
- Check the logs for detailed error messages
- Verify your configuration settings
- Test with the provided test script 