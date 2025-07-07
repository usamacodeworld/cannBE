# Checkout Module

The checkout module handles the complete order processing flow from cart to order completion, including payment processing, shipping calculations, order status management, and coupon system.

## Features

- **Order Management**: Complete order lifecycle from creation to delivery
- **Payment Processing**: Multiple payment gateway support (Credit Card, PayPal, Cash on Delivery, etc.)
- **Shipping Calculation**: Dynamic shipping rates and methods
- **Tax Calculation**: Automatic tax calculation based on location
- **Coupon System**: Discount codes and promotional offers
- **Guest Checkout**: Allow purchases without user registration
- **Order Tracking**: Real-time order status updates
- **Inventory Management**: Automatic stock reduction on order confirmation

## Entities

### Order
Main order entity containing all order information including payment status, shipping details, and totals.

### OrderItem
Individual items within each order with product snapshots, quantities, and prices.

### OrderStatusHistory
Track all status changes for orders with timestamps and user information.

### ShippingAddress
User shipping addresses for both registered users and order-specific addresses.

### Coupon
Discount codes and promotional offers with usage limits and validity periods.

## API Endpoints

### Checkout Process
- `POST /api/checkout/initiate` - Start checkout process
- `POST /api/checkout/shipping-address` - Set shipping address
- `POST /api/checkout/calculate-shipping` - Calculate shipping costs
- `POST /api/checkout/calculate-tax` - Calculate tax amounts
- `POST /api/checkout/apply-coupon` - Apply discount coupon
- `POST /api/checkout/confirm-order` - Confirm and create order

### Order Management
- `GET /api/checkout/orders` - Get user orders
- `GET /api/checkout/orders/:id` - Get specific order details

## Usage Examples

### Initiate Checkout
```javascript
POST /api/checkout/initiate
{
  "cartItems": [
    {
      "id": "cart-item-uuid",
      "productId": "product-uuid",
      "quantity": 2,
      "selectedVariants": [
        {
          "attributeId": "attr-uuid",
          "attributeValueId": "attr-val-uuid",
          "attributeName": "Size",
          "attributeValue": "Large",
          "additionalPrice": 5.00
        }
      ]
    }
  ],
  "checkoutType": "guest",
  "guestId": "guest-uuid"
}
```

### Apply Coupon
```javascript
POST /api/checkout/apply-coupon
{
  "checkoutId": "checkout-session-uuid",
  "couponCode": "SAVE20",
  "items": [
    {
      "productId": "product-uuid",
      "quantity": 2,
      "unitPrice": 74.99
    }
  ]
}
```

### Confirm Order
```javascript
POST /api/checkout/confirm-order
{
  "checkoutId": "checkout-session-uuid",
  "customerInfo": {
    "email": "customer@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  },
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "addressLine1": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "credit_card",
  "orderSummary": {
    "subtotal": 149.98,
    "taxAmount": 12.00,
    "shippingAmount": 9.99,
    "discountAmount": 29.99,
    "totalAmount": 141.98
  }
}
```

## Order Status Flow

1. **PENDING** - Order created, payment pending
2. **CONFIRMED** - Payment confirmed, order being processed
3. **PROCESSING** - Order being prepared
4. **SHIPPED** - Order shipped, tracking number available
5. **DELIVERED** - Order delivered to customer
6. **CANCELLED** - Order cancelled
7. **REFUNDED** - Order refunded
8. **RETURNED** - Order returned

## Payment Methods

- Credit Card
- Debit Card
- PayPal
- Stripe
- Cash on Delivery
- Bank Transfer
- Digital Wallet

## Coupon Types

- **Percentage**: Discount by percentage (e.g., 20% off)
- **Fixed Amount**: Discount by fixed amount (e.g., $10 off)
- **Free Shipping**: Free shipping discount

## Security Features

- Input validation on all endpoints
- Payment security compliance
- Rate limiting
- CSRF protection
- Data encryption for sensitive information
- Audit logging for all checkout activities

## Error Handling

The module provides comprehensive error handling with specific error codes:

- `CHECKOUT_INITIATION_FAILED`
- `ORDER_CONFIRMATION_FAILED`
- `INVALID_COUPON`
- `INSUFFICIENT_STOCK`
- `PAYMENT_FAILED`
- `ORDER_NOT_FOUND`

## Development Notes

- Uses TypeORM for database operations
- No raw SQL queries
- Follows existing codebase patterns
- Comprehensive validation using class-validator
- Session management for checkout process
- Automatic inventory updates
- Email notifications (configurable)

## Future Enhancements

- Integration with real payment gateways
- Advanced shipping provider integration
- Tax service integration
- Email notification system
- PDF invoice generation
- Subscription order support
- Advanced reporting and analytics 