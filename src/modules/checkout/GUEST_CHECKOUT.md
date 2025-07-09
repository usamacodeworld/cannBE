# Guest Checkout System

This document explains how the guest checkout system works in the CannBE e-commerce platform, allowing users to complete purchases without creating an account.

## Overview

The guest checkout system supports two types of users:
1. **Authenticated Users** - Users with accounts who are logged in
2. **Guest Users** - Users without accounts who can still complete purchases

## Key Components

### 1. Cart System
- Supports both `userId` and `guestId` for cart items
- Guest users get a unique `guestId` when adding items to cart
- Cart items are associated with either a user or guest

### 2. Order System
- Orders can be created for both authenticated and guest users
- Guest orders store customer information directly in the order
- Orders maintain the `guestId` for tracking

### 3. Authentication Middleware
- `authenticate` - Requires valid authentication
- `optionalAuth` - Allows both authenticated and guest users

## API Endpoints

### Cart Endpoints (Guest-Friendly)

#### Add to Cart
```http
POST /api/v1/cart/add
Content-Type: application/json

{
  "productId": "uuid",
  "quantity": 2,
  "guestId": "guest-123", // Optional - auto-generated if not provided
  "price": 29.99,
  "variants": [
    {
      "attributeId": "uuid",
      "attributeValueId": "uuid"
    }
  ]
}
```

#### Get Cart
```http
GET /api/v1/cart?guestId=guest-123
```

#### Update Cart Item
```http
PUT /api/v1/cart/:id
Content-Type: application/json

{
  "quantity": 3,
  "guestId": "guest-123"
}
```

#### Clear Cart
```http
DELETE /api/v1/cart/clear?guestId=guest-123
```

### Checkout Endpoints (Guest-Friendly)

#### Initiate Checkout
```http
POST /api/v1/checkout/initiate
Content-Type: application/json

{
  "checkoutType": "guest",
  "guestId": "guest-123",
  "shippingMethod": "standard",
  "paymentMethod": "credit_card"
}
```

#### Calculate Shipping
```http
POST /api/v1/checkout/calculate-shipping
Content-Type: application/json

{
  "checkoutId": "uuid",
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "addressLine1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "US",
    "phone": "+1234567890"
  }
}
```

#### Calculate Tax
```http
POST /api/v1/checkout/calculate-tax
Content-Type: application/json

{
  "checkoutId": "uuid",
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "addressLine1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "US"
  }
}
```

#### Apply Coupon
```http
POST /api/v1/checkout/apply-coupon
Content-Type: application/json

{
  "checkoutId": "uuid",
  "couponCode": "SAVE10"
}
```

#### Confirm Order
```http
POST /api/v1/checkout/confirm-order
Content-Type: application/json

{
  "checkoutId": "uuid",
  "guestId": "guest-123",
  "customerInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890"
  },
  "paymentMethod": "credit_card",
  "paymentData": {
    "cardNumber": "4111111111111111",
    "expiryMonth": "12",
    "expiryYear": "2025",
    "cvv": "123",
    "cardholderName": "John Doe"
  },
  "notes": "Guest order"
}
```

#### Get Orders (Guest)
```http
GET /api/v1/checkout/orders?guestId=guest-123
```

#### Get Order by ID (Guest)
```http
GET /api/v1/checkout/orders/:id?guestId=guest-123
```

## Guest Migration Endpoints

#### Check Guest Data
```http
GET /api/guest-migration/check/:guestId
```

#### Register and Migrate
```http
POST /api/guest-migration/register
Content-Type: application/json

{
  "guestId": "guest-1234567890",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "phone": "+1234567890"
}
```

## Data Flow

### Guest Checkout Flow

1. **Add to Cart**
   - Guest provides or system generates a `guestId`
   - Cart item is created with `guestId` and no `userId`

2. **Initiate Checkout**
   - Guest provides `guestId` and checkout preferences
   - System creates checkout session with guest information

3. **Calculate Costs**
   - Guest provides shipping address
   - System calculates shipping and tax based on address

4. **Confirm Order**
   - Guest provides customer and payment information
   - System creates order with `guestId` and customer details
   - Cart is cleared for the guest

5. **Order Tracking**
   - Guest can view orders using their `guestId`
   - Order confirmation email is sent to guest's email

### Authenticated User Flow

1. **Add to Cart**
   - User is authenticated via JWT token
   - Cart item is created with `userId` and no `guestId`

2. **Initiate Checkout**
   - System uses authenticated user's information
   - User can select from saved addresses

3. **Complete Checkout**
   - Order is created with `userId`
   - User can view orders in their account

## Guest ID Management

### Generation
- Guest IDs are auto-generated using `cuid()` if not provided
- Format: `guest-{timestamp}` or custom format
- Must be unique across all guest users

### Persistence
- Guest IDs are stored in browser localStorage/sessionStorage
- Can be shared via URL parameters for order tracking
- Should be included in all guest-related API calls

### Security
- Guest IDs are not tied to authentication
- Orders are accessible only with the correct `guestId`
- No sensitive user data is stored with guest orders

## Database Schema

### Cart Table
```sql
CREATE TABLE carts (
  id UUID PRIMARY KEY,
  guestId VARCHAR(255), -- For guest users
  userId UUID,          -- For authenticated users
  productId UUID NOT NULL,
  quantity INTEGER DEFAULT 1,
  price DECIMAL(10,2),
  variants JSON,
  isActive BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Orders Table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  orderNumber VARCHAR(255) UNIQUE,
  guestId VARCHAR(255), -- For guest orders
  userId UUID,          -- For authenticated user orders
  status order_status_enum DEFAULT 'pending',
  subtotal DECIMAL(10,2),
  taxAmount DECIMAL(10,2) DEFAULT 0,
  shippingAmount DECIMAL(10,2) DEFAULT 0,
  discountAmount DECIMAL(10,2) DEFAULT 0,
  totalAmount DECIMAL(10,2),
  paymentStatus payment_status_enum DEFAULT 'pending',
  paymentMethod payment_method_enum,
  paymentTransactionId VARCHAR(255),
  shippingAddress JSON,
  billingAddress JSON,
  customerEmail VARCHAR(255), -- For guest orders
  customerFirstName VARCHAR(255), -- For guest orders
  customerLastName VARCHAR(255), -- For guest orders
  customerPhone VARCHAR(255), -- For guest orders
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Error Handling

### Common Error Scenarios

1. **Missing Guest ID**
   ```json
   {
     "success": false,
     "error": {
       "code": "MISSING_IDENTIFIER",
       "message": "Guest ID is required for unauthenticated users"
     }
   }
   ```

2. **Invalid Guest ID**
   ```json
   {
     "success": false,
     "error": {
       "code": "FORBIDDEN",
       "message": "You do not have permission to view this order"
     }
   }
   ```

3. **Empty Cart**
   ```json
   {
     "success": false,
     "error": {
       "code": "EMPTY_CART",
       "message": "Cart is empty. Please add items to cart before checkout."
     }
   }
   ```

## Best Practices

### Frontend Implementation

1. **Guest ID Storage**
   ```javascript
   // Generate or retrieve guest ID
   let guestId = localStorage.getItem('guestId');
   if (!guestId) {
     guestId = 'guest-' + Date.now();
     localStorage.setItem('guestId', guestId);
   }
   ```

2. **API Calls**
   ```javascript
   // For guest users
   const addToCart = async (productId, quantity) => {
     const response = await fetch('/api/v1/cart/add', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         productId,
         quantity,
         guestId: localStorage.getItem('guestId')
       })
     });
     return response.json();
   };
   ```

3. **Order Tracking**
   ```javascript
   // Track guest orders
   const getGuestOrders = async () => {
     const guestId = localStorage.getItem('guestId');
     const response = await fetch(`/api/v1/checkout/orders?guestId=${guestId}`);
     return response.json();
   };
   ```

### Security Considerations

1. **Guest ID Validation**
   - Validate guest ID format and uniqueness
   - Implement rate limiting for guest operations
   - Monitor for suspicious guest ID patterns

2. **Order Access Control**
   - Ensure orders are only accessible with correct guest ID
   - Implement proper validation in all order-related endpoints
   - Log access attempts for security monitoring

3. **Data Privacy**
   - Store minimal customer data for guest orders
   - Implement data retention policies for guest orders
   - Provide options for guest users to create accounts

## Testing

Use the provided test script to verify guest checkout functionality:

```bash
# Run guest checkout tests
yarn ts-node scripts/test-guest-checkout.ts
```

The test script demonstrates:
- Adding items to cart as guest
- Initiating checkout without authentication
- Calculating shipping and tax
- Confirming orders
- Retrieving orders by guest ID

## Migration from Guest to Authenticated User

When a guest user creates an account, you can implement a migration strategy:

1. **Cart Migration**
   - Merge guest cart items into user's cart
   - Remove duplicate items or combine quantities
   - Clear guest cart after successful migration

2. **Order Association**
   - Update existing guest orders with new user ID
   - Maintain order history and tracking
   - Send notification to user about migrated orders

3. **Address Migration**
   - Save guest shipping/billing addresses to user's address book
   - Set as default addresses if user doesn't have any

This system provides a seamless shopping experience for both guest and authenticated users while maintaining data integrity and security. 