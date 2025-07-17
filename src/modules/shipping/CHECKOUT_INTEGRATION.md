# Shipping Integration with Checkout Process

This document explains how to integrate the shipping rate system with the checkout process to provide a streamlined and functional shipping experience.

## Overview

The shipping integration system provides a bridge between your custom shipping rates and the checkout flow, allowing you to:

- Calculate shipping costs based on cart items, address, and order value
- Support multiple rate types (flat rate, weight-based, price-based, item-based, etc.)
- Validate shipping methods for specific addresses
- Get default shipping options
- Provide detailed cost breakdowns

## API Endpoints

### 1. Calculate All Shipping Options

**Endpoint:** `POST /api/v1/shipping/checkout/calculate-options`

**Description:** Calculate shipping costs for all available shipping methods based on cart items and shipping address.

**Request Body:**
```json
{
  "items": [
    {
      "id": "item-1",
      "productId": "product-123",
      "quantity": 2,
      "price": 29.99,
      "weight": 1.5,
      "categoryIds": ["electronics", "gadgets"]
    },
    {
      "id": "item-2", 
      "productId": "product-456",
      "quantity": 1,
      "price": 49.99,
      "weight": 2.0,
      "categoryIds": ["clothing"]
    }
  ],
  "shippingAddress": {
    "country": "US",
    "state": "CA", 
    "city": "Los Angeles",
    "postalCode": "90210"
  },
  "orderValue": 109.97,
  "isHoliday": false
}
```

**Response:**
```json
{
  "message": "Shipping options calculated successfully",
  "requestId": "abc123",
  "data": [
    {
      "methodId": "method-1",
      "methodName": "Standard Shipping",
      "methodSlug": "standard-shipping",
      "rateId": "rate-1",
      "rateName": "Item-Based Rate",
      "rateType": "item_based",
      "baseRate": 4.99,
      "additionalCost": 1.99,
      "totalCost": 6.98,
      "estimatedDays": 3,
      "isDefault": true,
      "requiresSignature": false,
      "isInsured": false,
      "insuranceAmount": null,
      "breakdown": {
        "baseRate": 4.99,
        "additionalCost": 1.99,
        "handlingFee": 0.00,
        "insuranceFee": 0.00,
        "signatureFee": 0.00
      }
    }
  ],
  "code": 0
}
```

### 2. Get Default Shipping Option

**Endpoint:** `POST /api/v1/shipping/checkout/default-option`

**Description:** Get the default shipping method and its cost for the given cart items and address.

**Request Body:** Same as calculate-options

**Response:** Same structure as calculate-options, but returns only the default method.

### 3. Get Shipping Cost for Specific Method

**Endpoint:** `POST /api/v1/shipping/checkout/method/:methodId/cost`

**Description:** Calculate shipping cost for a specific shipping method.

**Request Body:** Same as calculate-options

**Response:** Same structure as calculate-options, but returns only the specified method.

### 4. Validate Shipping Method for Address

**Endpoint:** `POST /api/v1/shipping/checkout/validate/:methodId`

**Description:** Check if a shipping method is available for a specific address.

**Request Body:**
```json
{
  "shippingAddress": {
    "country": "US",
    "state": "CA",
    "city": "Los Angeles", 
    "postalCode": "90210"
  }
}
```

**Response:**
```json
{
  "message": "Shipping method is valid for this address",
  "requestId": "abc123",
  "data": {
    "isValid": true
  },
  "code": 0
}
```

## Integration with Frontend Checkout

### Step 1: Cart Items Structure

Ensure your cart items include the necessary information:

```typescript
interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  weight?: number;        // Required for weight-based rates
  categoryIds?: string[]; // Required for category-specific rates
}
```

### Step 2: Shipping Address Structure

```typescript
interface ShippingAddress {
  country: string;    // Required for country-based zones
  state: string;      // Required for state-based zones  
  city: string;       // Required for city-based zones
  postalCode: string; // Required for postal code-based zones
}
```

### Step 3: Frontend Integration Example

```typescript
// Calculate shipping options when user enters shipping address
async function calculateShippingOptions(cartItems: CartItem[], shippingAddress: ShippingAddress) {
  const orderValue = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  const response = await fetch('/api/v1/shipping/checkout/calculate-options', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: cartItems,
      shippingAddress,
      orderValue,
      isHoliday: false // Set based on current date or user preference
    })
  });

  const result = await response.json();
  
  if (result.code === 0) {
    return result.data; // Array of shipping options
  } else {
    throw new Error(result.message);
  }
}

// Display shipping options to user
function displayShippingOptions(options: ShippingCalculationResult[]) {
  options.forEach(option => {
    console.log(`${option.methodName}: $${option.totalCost.toFixed(2)}`);
    console.log(`  Estimated delivery: ${option.estimatedDays} days`);
    console.log(`  Rate type: ${option.rateType}`);
  });
}

// Get shipping cost for selected method
async function getShippingCost(methodId: string, cartItems: CartItem[], shippingAddress: ShippingAddress) {
  const orderValue = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  const response = await fetch(`/api/v1/shipping/checkout/method/${methodId}/cost`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: cartItems,
      shippingAddress,
      orderValue,
      isHoliday: false
    })
  });

  const result = await response.json();
  
  if (result.code === 0) {
    return result.data; // Single shipping option
  } else {
    throw new Error(result.message);
  }
}
```

## Rate Types and Calculations

### 1. Item-Based Rates (Most Common)

**Configuration:**
- Base Rate: $4.99
- First Item Count: 3
- Additional Item Rate: $1.99

**Calculation:**
- Items 1-3: $4.99 (base rate)
- Item 4+: $4.99 + (additional items × $1.99)

**Example:**
- 2 items: $4.99
- 5 items: $4.99 + (2 × $1.99) = $8.97

### 2. Flat Rate

**Configuration:**
- Base Rate: $9.99
- No additional charges

**Calculation:**
- Always $9.99 regardless of items or weight

### 3. Weight-Based Rates

**Configuration:**
- Base Rate: $5.99
- Min Weight: 0 lbs
- Max Weight: 5 lbs
- Weight Unit: 1 lb
- Additional Rate: $1.50 per lb

**Calculation:**
- Base covers first weight unit
- Additional weight charged per unit

### 4. Price-Based Rates

**Configuration:**
- Base Rate: $0.00
- Min Order Value: $0
- Max Order Value: $50
- Free shipping threshold: $50

**Calculation:**
- Orders under $50: Free shipping
- Orders $50+: Standard rate applies

## Best Practices

### 1. Error Handling

```typescript
try {
  const shippingOptions = await calculateShippingOptions(cartItems, address);
  // Handle success
} catch (error) {
  // Handle error - show fallback shipping or error message
  console.error('Shipping calculation failed:', error);
}
```

### 2. Caching

Consider caching shipping calculations for the same address and cart items to improve performance:

```typescript
const cacheKey = `${JSON.stringify(cartItems)}-${JSON.stringify(address)}`;
const cached = sessionStorage.getItem(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const options = await calculateShippingOptions(cartItems, address);
sessionStorage.setItem(cacheKey, JSON.stringify(options));
return options;
```

### 3. Fallback Options

Always provide fallback shipping options if the calculation fails:

```typescript
const fallbackShipping = {
  methodId: 'fallback',
  methodName: 'Standard Shipping',
  totalCost: 9.99,
  estimatedDays: 5
};
```

### 4. Real-time Updates

Update shipping costs when:
- User changes shipping address
- User adds/removes items from cart
- User applies/removes coupons (affects order value)

## Testing

Use the provided test script to verify your shipping integration:

```bash
yarn ts-node scripts/test-checkout-shipping.ts
```

This will test all the shipping calculation endpoints with sample data.

## Troubleshooting

### Common Issues

1. **No shipping options returned**
   - Check if shipping methods are active
   - Verify shipping zones are configured correctly
   - Ensure shipping rates exist for the methods

2. **Incorrect calculations**
   - Verify item weights are provided for weight-based rates
   - Check that category IDs match rate configurations
   - Ensure order value is calculated correctly

3. **Address validation failures**
   - Check zone configuration (country, state, city, postal code)
   - Verify address format matches zone criteria

### Debug Mode

Enable debug logging by setting the environment variable:
```bash
DEBUG_SHIPPING=true
```

This will log detailed information about shipping calculations and zone matching. 