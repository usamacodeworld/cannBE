# Coupon Creation Payload Examples

## Overview
This guide provides complete payload examples for creating coupons using the `/api/v1/coupons` endpoint with different scenarios based on coupon types.

## API Endpoint
```
POST /api/v1/coupons
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

---

## Coupon Type 1: Percentage Discounts

### 1.1 Basic Percentage Coupon
```json
{
  "code": "SAVE20",
  "type": "percentage",
  "value": 20,
  "validFrom": "2024-01-01T00:00:00Z",
  "validUntil": "2024-12-31T23:59:59Z",
  "description": "20% off sitewide"
}
```

### 1.2 Percentage with Usage Limit
```json
{
  "code": "WELCOME15",
  "type": "percentage",
  "value": 15,
  "validFrom": "2024-01-01T00:00:00Z",
  "validUntil": "2024-06-30T23:59:59Z",
  "usageLimit": 1000,
  "description": "15% off for new customers - Limited to 1000 uses"
}
```

### 1.3 Percentage with Minimum Order Amount
```json
{
  "code": "BULK25",
  "type": "percentage",
  "value": 25,
  "validFrom": "2024-01-01T00:00:00Z",
  "validUntil": "2024-03-31T23:59:59Z",
  "minimumAmount": 100,
  "description": "25% off orders over $100"
}
```

### 1.4 Percentage with Maximum Discount Cap
```json
{
  "code": "MEGA30",
  "type": "percentage",
  "value": 30,
  "validFrom": "2024-01-01T00:00:00Z",
  "validUntil": "2024-02-29T23:59:59Z",
  "maximumDiscount": 50,
  "description": "30% off up to $50 maximum discount"
}
```

### 1.5 Percentage with All Restrictions
```json
{
  "code": "VIP40",
  "type": "percentage",
  "value": 40,
  "validFrom": "2024-01-01T00:00:00Z",
  "validUntil": "2024-01-31T23:59:59Z",
  "usageLimit": 50,
  "minimumAmount": 200,
  "maximumDiscount": 80,
  "description": "VIP 40% off - Min $200 order, Max $80 discount, Limited to 50 uses"
}
```

### 1.6 Percentage with Product Targeting
```json
{
  "code": "ELECTRONICS20",
  "type": "percentage",
  "value": 20,
  "validFrom": "2024-01-01T00:00:00Z",
  "validUntil": "2024-12-31T23:59:59Z",
  "targetProducts": [
    "product-id-1",
    "product-id-2",
    "product-id-3"
  ],
  "description": "20% off selected electronics"
}
```

### 1.7 Percentage with Category Targeting
```json
{
  "code": "CLOTHING15",
  "type": "percentage",
  "value": 15,
  "validFrom": "2024-01-01T00:00:00Z",
  "validUntil": "2024-12-31T23:59:59Z",
  "targetCategories": [
    "category-clothing-id",
    "category-accessories-id"
  ],
  "description": "15% off all clothing and accessories"
}
```

### 1.8 Percentage with Product and Category Targeting
```json
{
  "code": "MIXED25",
  "type": "percentage",
  "value": 25,
  "validFrom": "2024-01-01T00:00:00Z",
  "validUntil": "2024-12-31T23:59:59Z",
  "targetProducts": [
    "product-featured-1",
    "product-featured-2"
  ],
  "targetCategories": [
    "category-sale-id"
  ],
  "minimumAmount": 75,
  "description": "25% off featured products and sale category with min $75 order"
}
```

---

## Coupon Type 2: Fixed Amount Discounts

### 2.1 Basic Fixed Amount Coupon
```json
{
  "code": "SAVE10",
  "type": "fixed_amount",
  "value": 10.00,
  "validFrom": "2024-01-01T00:00:00Z",
  "validUntil": "2024-12-31T23:59:59Z",
  "description": "$10 off any order"
}
```

### 2.2 Fixed Amount with Usage Limit
```json
{
  "code": "FIRST25",
  "type": "fixed_amount",
  "value": 25.00,
  "validFrom": "2024-01-01T00:00:00Z",
  "validUntil": "2024-12-31T23:59:59Z",
  "usageLimit": 500,
  "description": "$25 off first-time customers - Limited to 500 uses"
}
```

### 2.3 Fixed Amount with Minimum Order
```json
{
  "code": "SAVE50",
  "type": "fixed_amount",
  "value": 50.00,
  "validFrom": "2024-01-01T00:00:00Z",
  "validUntil": "2024-12-31T23:59:59Z",
  "minimumAmount": 200,
  "description": "$50 off orders over $200"
}
```

### 2.4 Fixed Amount with Product Targeting
```json
{
  "code": "GADGET30",
  "type": "fixed_amount",
  "value": 30.00,
  "validFrom": "2024-01-01T00:00:00Z",
  "validUntil": "2024-12-31T23:59:59Z",
  "targetProducts": [
    "gadget-product-1",
    "gadget-product-2"
  ],
  "description": "$30 off selected gadgets"
}
```

### 2.5 Fixed Amount with Category Targeting
```json
{
  "code": "BOOKS15",
  "type": "fixed_amount",
  "value": 15.00,
  "validFrom": "2024-01-01T00:00:00Z",
  "validUntil": "2024-12-31T23:59:59Z",
  "targetCategories": [
    "category-books-id",
    "category-ebooks-id"
  ],
  "minimumAmount": 50,
  "description": "$15 off books and ebooks with min $50 order"
}
```

### 2.6 High-Value Fixed Amount with All Restrictions
```json
{
  "code": "PREMIUM100",
  "type": "fixed_amount",
  "value": 100.00,
  "validFrom": "2024-01-01T00:00:00Z",
  "validUntil": "2024-01-31T23:59:59Z",
  "usageLimit": 10,
  "minimumAmount": 500,
  "targetCategories": [
    "category-premium-id"
  ],
  "description": "$100 off premium items - Min $500 order, Limited to 10 uses"
}
```

---

## Coupon Type 3: Free Shipping

### 3.1 Basic Free Shipping Coupon
```json
{
  "code": "FREESHIP",
  "type": "free_shipping",
  "value": 0,
  "validFrom": "2024-01-01T00:00:00Z",
  "validUntil": "2024-12-31T23:59:59Z",
  "description": "Free shipping on any order"
}
```

### 3.2 Free Shipping with Minimum Order
```json
{
  "code": "SHIPFREE50",
  "type": "free_shipping",
  "value": 0,
  "validFrom": "2024-01-01T00:00:00Z",
  "validUntil": "2024-12-31T23:59:59Z",
  "minimumAmount": 50,
  "description": "Free shipping on orders over $50"
}
```

### 3.3 Free Shipping with Usage Limit
```json
{
  "code": "HOLIDAY2024",
  "type": "free_shipping",
  "value": 0,
  "validFrom": "2024-12-01T00:00:00Z",
  "validUntil": "2024-12-31T23:59:59Z",
  "usageLimit": 2000,
  "description": "Free holiday shipping - Limited to 2000 uses"
}
```

### 3.4 Free Shipping with Product Targeting
```json
{
  "code": "BULKSHIP",
  "type": "free_shipping",
  "value": 0,
  "validFrom": "2024-01-01T00:00:00Z",
  "validUntil": "2024-12-31T23:59:59Z",
  "targetProducts": [
    "bulk-product-1",
    "bulk-product-2"
  ],
  "description": "Free shipping on selected bulk items"
}
```

### 3.5 Free Shipping with Category Targeting
```json
{
  "code": "FURNITURESHIP",
  "type": "free_shipping",
  "value": 0,
  "validFrom": "2024-01-01T00:00:00Z",
  "validUntil": "2024-12-31T23:59:59Z",
  "targetCategories": [
    "category-furniture-id"
  ],
  "minimumAmount": 300,
  "description": "Free shipping on furniture orders over $300"
}
```

### 3.6 Free Shipping with All Restrictions
```json
{
  "code": "EXCLUSIVE2024",
  "type": "free_shipping",
  "value": 0,
  "validFrom": "2024-01-01T00:00:00Z",
  "validUntil": "2024-03-31T23:59:59Z",
  "usageLimit": 100,
  "minimumAmount": 150,
  "targetCategories": [
    "category-exclusive-id"
  ],
  "description": "Free shipping on exclusive items - Min $150 order, Limited to 100 uses"
}
```

---

## Special Scenarios

### 4.1 Inactive Coupon (Created but Not Active)
```json
{
  "code": "FUTURE25",
  "type": "percentage",
  "value": 25,
  "isActive": false,
  "validFrom": "2024-06-01T00:00:00Z",
  "validUntil": "2024-06-30T23:59:59Z",
  "description": "25% off summer sale - Not active yet"
}
```

### 4.2 Short-Term Flash Sale
```json
{
  "code": "FLASH50",
  "type": "percentage",
  "value": 50,
  "validFrom": "2024-01-15T10:00:00Z",
  "validUntil": "2024-01-15T22:00:00Z",
  "usageLimit": 100,
  "description": "50% off flash sale - 12 hours only!"
}
```

### 4.3 One-Time Use Coupon
```json
{
  "code": "UNIQUE123",
  "type": "fixed_amount",
  "value": 20.00,
  "validFrom": "2024-01-01T00:00:00Z",
  "validUntil": "2024-12-31T23:59:59Z",
  "usageLimit": 1,
  "description": "One-time $20 off coupon"
}
```

### 4.4 High-Value Percentage with Safety Cap
```json
{
  "code": "CRAZY75",
  "type": "percentage",
  "value": 75,
  "validFrom": "2024-01-01T00:00:00Z",
  "validUntil": "2024-01-02T23:59:59Z",
  "maximumDiscount": 100,
  "usageLimit": 5,
  "minimumAmount": 200,
  "description": "Crazy 75% off - Max $100 discount, Min $200 order, Only 5 uses"
}
```

### 4.5 Seasonal Coupon with Multiple Targets
```json
{
  "code": "SPRING2024",
  "type": "percentage",
  "value": 30,
  "validFrom": "2024-03-01T00:00:00Z",
  "validUntil": "2024-05-31T23:59:59Z",
  "targetProducts": [
    "spring-product-1",
    "spring-product-2"
  ],
  "targetCategories": [
    "category-spring-id",
    "category-garden-id"
  ],
  "minimumAmount": 75,
  "maximumDiscount": 40,
  "description": "Spring collection 30% off - Selected items and categories"
}
```

---

## Validation Rules

### Required Fields
- `code`: String (3-50 characters, alphanumeric + hyphens)
- `type`: Enum ("percentage", "fixed_amount", "free_shipping")
- `value`: Number (see type-specific rules below)
- `validFrom`: ISO date string
- `validUntil`: ISO date string

### Type-Specific Value Rules
- **Percentage**: `value` must be 0-100
- **Fixed Amount**: `value` must be >= 0.01
- **Free Shipping**: `value` should be 0 (ignored in processing)

### Optional Fields
- `isActive`: Boolean (default: true)
- `usageLimit`: Number >= 1 (null = unlimited)
- `minimumAmount`: Number >= 0.01
- `maximumDiscount`: Number >= 0.01 (only for percentage type)
- `description`: String (max 500 characters)
- `targetProducts`: Array of product IDs
- `targetCategories`: Array of category IDs

---

## Error Scenarios

### 4.1 Invalid Coupon Code
```json
{
  "code": "INVALID CODE!",
  "type": "percentage",
  "value": 20,
  "validFrom": "2024-01-01T00:00:00Z",
  "validUntil": "2024-12-31T23:59:59Z"
}
```
**Error Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "code": ["Code must contain only alphanumeric characters and hyphens"]
  }
}
```

### 4.2 Invalid Percentage Value
```json
{
  "code": "INVALID150",
  "type": "percentage",
  "value": 150,
  "validFrom": "2024-01-01T00:00:00Z",
  "validUntil": "2024-12-31T23:59:59Z"
}
```
**Error Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "value": ["Percentage value must be between 0 and 100"]
  }
}
```

### 4.3 Invalid Date Range
```json
{
  "code": "INVALIDDATE",
  "type": "percentage",
  "value": 20,
  "validFrom": "2024-12-31T23:59:59Z",
  "validUntil": "2024-01-01T00:00:00Z"
}
```
**Error Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "validUntil": ["Valid until date must be after valid from date"]
  }
}
```

### 4.4 Duplicate Coupon Code
```json
{
  "code": "EXISTING",
  "type": "percentage",
  "value": 20,
  "validFrom": "2024-01-01T00:00:00Z",
  "validUntil": "2024-12-31T23:59:59Z"
}
```
**Error Response:**
```json
{
  "success": false,
  "message": "Coupon code already exists",
  "errors": {
    "code": ["A coupon with this code already exists"]
  }
}
```

---

## Success Response

### Successful Creation
```json
{
  "success": true,
  "message": "Coupon created successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "code": "SAVE20",
    "type": "percentage",
    "value": 20,
    "isActive": true,
    "validFrom": "2024-01-01T00:00:00.000Z",
    "validUntil": "2024-12-31T23:59:59.000Z",
    "usageLimit": null,
    "usageCount": 0,
    "minimumAmount": null,
    "maximumDiscount": null,
    "description": "20% off sitewide",
    "targetProducts": [],
    "targetCategories": [],
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

---

## Frontend Usage Examples

### React Component Example
```jsx
const CreateCouponForm = () => {
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: 0,
    validFrom: '',
    validUntil: '',
    usageLimit: '',
    minimumAmount: '',
    maximumDiscount: '',
    description: '',
    targetProducts: [],
    targetCategories: []
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prepare payload
    const payload = {
      code: formData.code.toUpperCase(),
      type: formData.type,
      value: Number(formData.value),
      validFrom: new Date(formData.validFrom).toISOString(),
      validUntil: new Date(formData.validUntil).toISOString(),
      ...(formData.usageLimit && { usageLimit: Number(formData.usageLimit) }),
      ...(formData.minimumAmount && { minimumAmount: Number(formData.minimumAmount) }),
      ...(formData.maximumDiscount && { maximumDiscount: Number(formData.maximumDiscount) }),
      ...(formData.description && { description: formData.description }),
      ...(formData.targetProducts.length > 0 && { targetProducts: formData.targetProducts }),
      ...(formData.targetCategories.length > 0 && { targetCategories: formData.targetCategories })
    };

    try {
      const response = await fetch('/api/v1/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Coupon created successfully!');
        // Reset form or redirect
      } else {
        // Handle validation errors
        setErrors(result.errors);
      }
    } catch (error) {
      console.error('Error creating coupon:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

### JavaScript/TypeScript Example
```typescript
interface CreateCouponPayload {
  code: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
  value: number;
  validFrom: string;
  validUntil: string;
  isActive?: boolean;
  usageLimit?: number;
  minimumAmount?: number;
  maximumDiscount?: number;
  description?: string;
  targetProducts?: string[];
  targetCategories?: string[];
}

const createCoupon = async (payload: CreateCouponPayload) => {
  try {
    const response = await fetch('/api/v1/coupons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to create coupon');
    }

    return result.data;
  } catch (error) {
    console.error('Error creating coupon:', error);
    throw error;
  }
};

// Usage examples
const examples = {
  // Basic percentage coupon
  percentage: () => createCoupon({
    code: 'SAVE20',
    type: 'percentage',
    value: 20,
    validFrom: '2024-01-01T00:00:00Z',
    validUntil: '2024-12-31T23:59:59Z'
  }),

  // Fixed amount with restrictions
  fixedAmount: () => createCoupon({
    code: 'SAVE50',
    type: 'fixed_amount',
    value: 50,
    validFrom: '2024-01-01T00:00:00Z',
    validUntil: '2024-12-31T23:59:59Z',
    minimumAmount: 200,
    usageLimit: 100
  }),

  // Free shipping
  freeShipping: () => createCoupon({
    code: 'FREESHIP',
    type: 'free_shipping',
    value: 0,
    validFrom: '2024-01-01T00:00:00Z',
    validUntil: '2024-12-31T23:59:59Z',
    minimumAmount: 50
  })
};
```

---

This comprehensive guide provides all the payload examples your frontend developer needs to implement coupon creation functionality for different scenarios and coupon types. 