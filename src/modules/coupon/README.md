# Coupon Management Module

This module provides comprehensive coupon management functionality for discount campaigns, promotional offers, and marketing initiatives.

## Features

- ✅ **Complete CRUD Operations** - Create, read, update, delete coupons
- ✅ **Multiple Coupon Types** - Percentage, fixed amount, free shipping
- ✅ **Advanced Validation** - Date ranges, usage limits, minimum amounts
- ✅ **Product/Category Targeting** - Apply coupons to specific items
- ✅ **Usage Tracking** - Monitor coupon performance and analytics
- ✅ **Bulk Operations** - Create multiple coupons at once
- ✅ **Export/Import** - CSV export for reporting
- ✅ **Real-time Validation** - Validate coupons during checkout

## API Endpoints

### Admin Routes (Authentication + MANAGE_STORE permission required)

#### Create Coupon
```
POST /api/v1/coupons
```

**Request Body:**
```json
{
  "code": "WELCOME20",
  "name": "20% Off Welcome Discount",
  "description": "Welcome new customers with 20% off their first order",
  "type": "percentage",
  "value": 20,
  "minimumAmount": 50,
  "maximumDiscount": 100,
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-12-31T23:59:59Z",
  "usageLimit": 1000,
  "usageLimitPerUser": 1,
  "isActive": true,
  "applicableCategories": ["category-uuid-1", "category-uuid-2"],
  "applicableProducts": ["product-uuid-1", "product-uuid-2"]
}
```

**Response:**
```json
{
  "message": "Coupon created successfully",
  "requestId": "req-123",
  "data": {
    "id": "coupon-uuid",
    "code": "WELCOME20",
    "name": "20% Off Welcome Discount",
    "type": "percentage",
    "value": 20,
    "remainingUses": 1000,
    "isExpired": false,
    "isValid": true,
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "code": 0
}
```

#### Get All Coupons
```
GET /api/v1/coupons?page=1&limit=10&search=welcome&type=percentage&isActive=true
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search in code, name, or description
- `code` - Filter by specific coupon code
- `type` - Filter by coupon type (percentage, fixed_amount, free_shipping)
- `isActive` - Filter by active status
- `isExpired` - Filter by expiration status
- `createdBy` - Filter by creator
- `categoryId` - Filter applicable to category
- `productId` - Filter applicable to product

#### Get Coupon by ID
```
GET /api/v1/coupons/{id}
```

#### Update Coupon
```
PUT /api/v1/coupons/{id}
```

#### Delete Coupon
```
DELETE /api/v1/coupons/{id}
```

#### Activate/Deactivate Coupon
```
PATCH /api/v1/coupons/{id}/activate
PATCH /api/v1/coupons/{id}/deactivate
```

#### Get Coupon Statistics
```
GET /api/v1/coupons/stats
```

**Response:**
```json
{
  "data": {
    "totalCoupons": 150,
    "activeCoupons": 120,
    "expiredCoupons": 30,
    "totalUsage": 5420,
    "mostUsedCoupons": [
      {
        "code": "SAVE10",
        "name": "$10 Off Orders",
        "usageCount": 342
      }
    ]
  }
}
```

#### Bulk Create Coupons
```
POST /api/v1/coupons/bulk
```

**Request Body:**
```json
{
  "baseCode": "HOLIDAY",
  "count": 100,
  "type": "percentage",
  "value": 15,
  "name": "Holiday Sale",
  "description": "15% off holiday sale",
  "minimumAmount": 25,
  "usageLimit": 1,
  "usageLimitPerUser": 1
}
```

Creates coupons: HOLIDAY001, HOLIDAY002, ..., HOLIDAY100

#### Export Coupons
```
GET /api/v1/coupons/export?format=csv
```

Returns CSV file with coupon data.

#### Check Code Availability
```
GET /api/v1/coupons/check-code/{code}
```

### Public Routes (No authentication required)

#### Validate Coupon
```
POST /api/v1/coupons/validate
```

**Request Body:**
```json
{
  "couponCode": "WELCOME20",
  "items": [
    {
      "productId": "product-uuid-1",
      "categoryId": "category-uuid-1",
      "quantity": 2,
      "unitPrice": 25.00,
      "totalPrice": 50.00
    }
  ],
  "subtotal": 75.00,
  "userId": "user-uuid"
}
```

**Response:**
```json
{
  "data": {
    "isValid": true,
    "coupon": {
      "id": "coupon-uuid",
      "code": "WELCOME20",
      "type": "percentage",
      "value": 20
    },
    "discountAmount": 15.00,
    "message": "Coupon is valid"
  }
}
```

#### Get Coupon by Code
```
GET /api/v1/coupons/code/{code}
```

## Coupon Types

### 1. Percentage Discount
```json
{
  "type": "percentage",
  "value": 20,
  "maximumDiscount": 100
}
```
- Applies percentage discount to applicable items
- Optional maximum discount cap

### 2. Fixed Amount Discount
```json
{
  "type": "fixed_amount",
  "value": 10,
  "minimumAmount": 50
}
```
- Applies fixed dollar amount discount
- Requires minimum order amount

### 3. Free Shipping
```json
{
  "type": "free_shipping",
  "value": 0,
  "minimumAmount": 25
}
```
- Removes shipping charges
- Usually requires minimum order amount

## Business Rules

### Validation Rules
1. **Date Validation**: Start date must be before end date
2. **Percentage Range**: Percentage discounts must be 0-100%
3. **Positive Values**: Fixed amounts must be positive
4. **Usage Limits**: Must be at least 1 if specified
5. **Unique Codes**: Coupon codes must be unique across the system

### Application Logic
1. **Product Targeting**: If `applicableProducts` is specified, coupon only applies to those products
2. **Category Targeting**: If `applicableCategories` is specified, coupon applies to products in those categories
3. **Combination Logic**: Product and category rules are combined with AND logic
4. **Empty Arrays**: Empty arrays mean "applies to all"

## Frontend Integration Examples

### React Coupon Validation Component
```tsx
import React, { useState } from 'react';

const CouponValidator = ({ cartItems, subtotal, onCouponApplied }) => {
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateCoupon = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/v1/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          couponCode,
          items: cartItems.map(item => ({
            productId: item.productId,
            categoryId: item.categoryId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice
          })),
          subtotal
        })
      });

      const result = await response.json();

      if (result.data.isValid) {
        onCouponApplied(result.data);
      } else {
        setError(result.data.message || 'Invalid coupon');
      }
    } catch (err) {
      setError('Failed to validate coupon');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="coupon-validator">
      <input
        type="text"
        value={couponCode}
        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
        placeholder="Enter coupon code"
      />
      <button onClick={validateCoupon} disabled={loading}>
        {loading ? 'Validating...' : 'Apply Coupon'}
      </button>
      {error && <div className="error">{error}</div>}
    </div>
  );
};
```

### Admin Coupon Management
```tsx
const CouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [filters, setFilters] = useState({});

  const fetchCoupons = async () => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`/api/v1/coupons?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await response.json();
    setCoupons(result.data.data);
  };

  const createCoupon = async (couponData) => {
    const response = await fetch('/api/v1/coupons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(couponData)
    });
    
    if (response.ok) {
      fetchCoupons(); // Refresh list
    }
  };

  // Component JSX here...
};
```

## Common Use Cases

### 1. Welcome Discount for New Customers
```json
{
  "code": "WELCOME10",
  "name": "Welcome 10% Off",
  "type": "percentage",
  "value": 10,
  "usageLimitPerUser": 1,
  "minimumAmount": 25
}
```

### 2. Seasonal Sale Campaign
```json
{
  "code": "SUMMER2024",
  "name": "Summer Sale 25% Off",
  "type": "percentage",
  "value": 25,
  "startDate": "2024-06-01",
  "endDate": "2024-08-31",
  "applicableCategories": ["summer-clothing", "swimwear"]
}
```

### 3. Free Shipping Promotion
```json
{
  "code": "FREESHIP50",
  "name": "Free Shipping on $50+",
  "type": "free_shipping",
  "value": 0,
  "minimumAmount": 50
}
```

### 4. Bulk Loyalty Rewards
```json
{
  "baseCode": "LOYAL",
  "count": 500,
  "type": "fixed_amount",
  "value": 5,
  "name": "Loyalty Reward",
  "usageLimit": 1,
  "usageLimitPerUser": 1
}
```

## Error Handling

### Common Error Responses
```json
{
  "message": "Coupon code already exists",
  "code": 1
}

{
  "message": "Coupon has expired",
  "code": 1
}

{
  "message": "Minimum order amount of $50 required",
  "code": 1
}

{
  "message": "Coupon usage limit exceeded",
  "code": 1
}
```

## Integration with Checkout

The coupon module integrates seamlessly with the checkout process:

1. **Validation**: Coupons are validated in real-time during checkout
2. **Application**: Discounts are automatically applied to applicable items
3. **Usage Tracking**: Coupon usage is incremented upon successful order completion
4. **History**: Applied coupons are stored with order records

## Performance Considerations

1. **Caching**: Frequently used coupons should be cached
2. **Indexing**: Database indexes on `code`, `isActive`, and date fields
3. **Pagination**: Large coupon lists use pagination
4. **Bulk Operations**: Use transaction-safe bulk operations for high-volume scenarios

## Security Features

1. **Permission-Based Access**: Admin operations require `MANAGE_STORE` permission
2. **Code Uniqueness**: Prevents duplicate coupon codes
3. **Usage Limits**: Prevents abuse through usage tracking
4. **Date Validation**: Ensures coupons can't be used outside valid periods
5. **Input Validation**: All inputs are validated and sanitized

## Analytics & Reporting

The module provides comprehensive analytics:
- Total coupon usage statistics
- Most popular coupons
- Revenue impact tracking
- Export capabilities for external analysis
- Performance metrics per campaign

This coupon management system provides a robust foundation for promotional campaigns and customer engagement initiatives. 