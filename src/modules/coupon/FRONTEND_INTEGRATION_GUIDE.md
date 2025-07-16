# Coupon Module - Frontend Integration Guide

## Overview
The coupon module provides a complete discount and promotional system with admin management and customer-facing features. This guide covers all frontend integration aspects.

## Table of Contents
1. [API Endpoints Overview](#api-endpoints-overview)
2. [Authentication & Permissions](#authentication--permissions)
3. [Data Structures](#data-structures)
4. [Admin Interface Flow](#admin-interface-flow)
5. [Customer Interface Flow](#customer-interface-flow)
6. [Integration with Checkout](#integration-with-checkout)
7. [Error Handling](#error-handling)
8. [Implementation Examples](#implementation-examples)

---

## API Endpoints Overview

### Base URL
All coupon endpoints are under: `/api/v1/coupons`

### Admin Endpoints (Requires Authentication + MANAGE_STORE Permission)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create new coupon |
| GET | `/` | Get all coupons with filters |
| GET | `/:id` | Get specific coupon |
| PUT | `/:id` | Update coupon |
| DELETE | `/:id` | Delete coupon |
| GET | `/:id/stats` | Get coupon usage statistics |
| POST | `/bulk` | Create multiple coupons |
| GET | `/export` | Export coupons as CSV |

### Public Endpoints (No Authentication Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/validate` | Validate coupon code |
| GET | `/check/:code` | Check if code exists |

---

## Authentication & Permissions

### Admin Features
- **Authentication**: Required (JWT token in Authorization header)
- **Permission**: `MANAGE_STORE` permission required
- **Header**: `Authorization: Bearer <jwt_token>`

### Customer Features
- **Authentication**: Not required for validation
- **Usage**: Coupons can be validated without login

---

## Data Structures

### Coupon Entity
```typescript
interface Coupon {
  id: string;
  code: string;                    // Unique coupon code
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
  value: number;                   // Percentage (0-100) or fixed amount
  isActive: boolean;
  validFrom: Date;
  validUntil: Date;
  usageLimit: number | null;       // null = unlimited
  usageCount: number;
  minimumAmount: number | null;    // Minimum order amount
  maximumDiscount: number | null;  // Cap for percentage discounts
  description: string | null;
  targetProducts: string[];        // Array of product IDs
  targetCategories: string[];      // Array of category IDs
  createdAt: Date;
  updatedAt: Date;
}
```

### Create Coupon DTO
```typescript
interface CreateCouponDto {
  code: string;                    // 3-50 chars, alphanumeric + hyphens
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
  value: number;                   // 0-100 for percentage, min 0.01 for fixed
  isActive?: boolean;              // Default: true
  validFrom: string;               // ISO date string
  validUntil: string;              // ISO date string
  usageLimit?: number;             // Optional usage limit
  minimumAmount?: number;          // Optional minimum order amount
  maximumDiscount?: number;        // Optional discount cap
  description?: string;
  targetProducts?: string[];       // Optional product targeting
  targetCategories?: string[];     // Optional category targeting
}
```

### Validation Response
```typescript
interface ValidationResponse {
  success: boolean;
  message: string;
  coupon?: Coupon;
  discountAmount?: number;
  errors?: string[];
}
```

---

## Admin Interface Flow

### 1. Coupon Management Dashboard

#### Get All Coupons
```typescript
// API Call
GET /api/v1/coupons?page=1&limit=10&search=SAVE20&type=percentage&isActive=true

// Response
{
  "success": true,
  "data": {
    "coupons": Coupon[],
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

#### Frontend Implementation
```tsx
const CouponDashboard = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    type: '',
    isActive: ''
  });

  const fetchCoupons = async () => {
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/v1/coupons?${params}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      if (result.success) {
        setCoupons(result.data.coupons);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [filters]);

  return (
    <div className="coupon-dashboard">
      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search coupons..."
          value={filters.search}
          onChange={(e) => setFilters({...filters, search: e.target.value})}
        />
        <select 
          value={filters.type}
          onChange={(e) => setFilters({...filters, type: e.target.value})}
        >
          <option value="">All Types</option>
          <option value="percentage">Percentage</option>
          <option value="fixed_amount">Fixed Amount</option>
          <option value="free_shipping">Free Shipping</option>
        </select>
        <select 
          value={filters.isActive}
          onChange={(e) => setFilters({...filters, isActive: e.target.value})}
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* Coupon Table */}
      <div className="coupon-table">
        {coupons.map(coupon => (
          <CouponRow key={coupon.id} coupon={coupon} onUpdate={fetchCoupons} />
        ))}
      </div>
    </div>
  );
};
```

### 2. Create/Edit Coupon Form

#### Create Coupon
```typescript
// API Call
POST /api/v1/coupons
Content-Type: application/json
Authorization: Bearer <token>

{
  "code": "SAVE20",
  "type": "percentage",
  "value": 20,
  "validFrom": "2024-01-01T00:00:00Z",
  "validUntil": "2024-12-31T23:59:59Z",
  "usageLimit": 100,
  "minimumAmount": 50,
  "maximumDiscount": 25,
  "description": "20% off with minimum $50 order",
  "targetCategories": ["category-id-1", "category-id-2"]
}
```

#### Frontend Form Component
```tsx
const CouponForm = ({ coupon, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    code: coupon?.code || '',
    type: coupon?.type || 'percentage',
    value: coupon?.value || 0,
    isActive: coupon?.isActive ?? true,
    validFrom: coupon?.validFrom || '',
    validUntil: coupon?.validUntil || '',
    usageLimit: coupon?.usageLimit || '',
    minimumAmount: coupon?.minimumAmount || '',
    maximumDiscount: coupon?.maximumDiscount || '',
    description: coupon?.description || '',
    targetProducts: coupon?.targetProducts || [],
    targetCategories: coupon?.targetCategories || []
  });

  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = coupon ? `/api/v1/coupons/${coupon.id}` : '/api/v1/coupons';
      const method = coupon ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (result.success) {
        onSave(result.data);
      } else {
        setErrors(result.errors || { general: result.message });
      }
    } catch (error) {
      setErrors({ general: 'Failed to save coupon' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="coupon-form">
      <div className="form-group">
        <label>Coupon Code*</label>
        <input
          type="text"
          value={formData.code}
          onChange={(e) => setFormData({...formData, code: e.target.value})}
          placeholder="e.g., SAVE20"
          required
        />
        {errors.code && <span className="error">{errors.code}</span>}
      </div>

      <div className="form-group">
        <label>Type*</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({...formData, type: e.target.value})}
        >
          <option value="percentage">Percentage</option>
          <option value="fixed_amount">Fixed Amount</option>
          <option value="free_shipping">Free Shipping</option>
        </select>
      </div>

      <div className="form-group">
        <label>
          {formData.type === 'percentage' ? 'Percentage (%)' : 
           formData.type === 'fixed_amount' ? 'Amount ($)' : 'Value'}*
        </label>
        <input
          type="number"
          value={formData.value}
          onChange={(e) => setFormData({...formData, value: Number(e.target.value)})}
          min={formData.type === 'percentage' ? 0 : 0.01}
          max={formData.type === 'percentage' ? 100 : undefined}
          step={formData.type === 'percentage' ? 1 : 0.01}
          required
        />
        {errors.value && <span className="error">{errors.value}</span>}
      </div>

      <div className="form-group">
        <label>Valid From*</label>
        <input
          type="datetime-local"
          value={formData.validFrom}
          onChange={(e) => setFormData({...formData, validFrom: e.target.value})}
          required
        />
      </div>

      <div className="form-group">
        <label>Valid Until*</label>
        <input
          type="datetime-local"
          value={formData.validUntil}
          onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
          required
        />
      </div>

      <div className="form-group">
        <label>Usage Limit</label>
        <input
          type="number"
          value={formData.usageLimit}
          onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
          placeholder="Leave empty for unlimited"
          min="1"
        />
      </div>

      <div className="form-group">
        <label>Minimum Order Amount</label>
        <input
          type="number"
          value={formData.minimumAmount}
          onChange={(e) => setFormData({...formData, minimumAmount: e.target.value})}
          placeholder="Minimum amount required"
          min="0.01"
          step="0.01"
        />
      </div>

      {formData.type === 'percentage' && (
        <div className="form-group">
          <label>Maximum Discount</label>
          <input
            type="number"
            value={formData.maximumDiscount}
            onChange={(e) => setFormData({...formData, maximumDiscount: e.target.value})}
            placeholder="Cap the discount amount"
            min="0.01"
            step="0.01"
          />
        </div>
      )}

      <div className="form-group">
        <label>Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Optional description"
        />
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
          />
          Active
        </label>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary">
          {coupon ? 'Update' : 'Create'} Coupon
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
};
```

### 3. Coupon Statistics

#### Get Coupon Statistics
```typescript
// API Call
GET /api/v1/coupons/{id}/stats

// Response
{
  "success": true,
  "data": {
    "usageCount": 45,
    "totalDiscount": 1250.75,
    "averageDiscount": 27.79,
    "remainingUses": 55,
    "usageRate": 0.45
  }
}
```

### 4. Bulk Operations

#### Create Multiple Coupons
```typescript
// API Call
POST /api/v1/coupons/bulk
Content-Type: application/json
Authorization: Bearer <token>

{
  "coupons": [
    {
      "code": "SAVE10",
      "type": "percentage",
      "value": 10,
      "validFrom": "2024-01-01T00:00:00Z",
      "validUntil": "2024-12-31T23:59:59Z"
    },
    {
      "code": "SAVE20",
      "type": "percentage", 
      "value": 20,
      "validFrom": "2024-01-01T00:00:00Z",
      "validUntil": "2024-12-31T23:59:59Z"
    }
  ]
}
```

---

## Customer Interface Flow

### 1. Coupon Validation in Cart/Checkout

#### Validate Coupon Code
```typescript
// API Call
POST /api/v1/coupons/validate
Content-Type: application/json

{
  "code": "SAVE20",
  "cartTotal": 125.50,
  "productIds": ["product-1", "product-2"],
  "categoryIds": ["category-1", "category-2"]
}

// Success Response
{
  "success": true,
  "message": "Coupon applied successfully",
  "coupon": {
    "id": "coupon-id",
    "code": "SAVE20",
    "type": "percentage",
    "value": 20,
    "description": "20% off with minimum $50 order"
  },
  "discountAmount": 25.10
}

// Error Response
{
  "success": false,
  "message": "Coupon has expired",
  "errors": ["Coupon expired on 2024-01-01"]
}
```

#### Frontend Implementation
```tsx
const CouponInput = ({ cartTotal, productIds, categoryIds, onCouponApplied }) => {
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const validateCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/v1/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          cartTotal,
          productIds,
          categoryIds
        })
      });

      const result = await response.json();

      if (result.success) {
        setAppliedCoupon(result.coupon);
        onCouponApplied(result.coupon, result.discountAmount);
        setError('');
      } else {
        setError(result.message);
        setAppliedCoupon(null);
      }
    } catch (error) {
      setError('Failed to validate coupon');
    } finally {
      setLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    onCouponApplied(null, 0);
  };

  return (
    <div className="coupon-input">
      {!appliedCoupon ? (
        <div className="input-group">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="Enter coupon code"
            className="coupon-field"
            disabled={loading}
          />
          <button
            onClick={validateCoupon}
            disabled={loading || !couponCode.trim()}
            className="apply-btn"
          >
            {loading ? 'Validating...' : 'Apply'}
          </button>
        </div>
      ) : (
        <div className="applied-coupon">
          <div className="coupon-info">
            <span className="coupon-code">{appliedCoupon.code}</span>
            <span className="coupon-description">{appliedCoupon.description}</span>
          </div>
          <button onClick={removeCoupon} className="remove-btn">
            Remove
          </button>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};
```

### 2. Quick Code Availability Check

#### Check if Code Exists
```typescript
// API Call
GET /api/v1/coupons/check/SAVE20

// Response
{
  "success": true,
  "data": {
    "exists": true,
    "isActive": true,
    "isExpired": false
  }
}
```

#### Frontend Implementation
```tsx
const QuickCodeCheck = ({ code }) => {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (code && code.length >= 3) {
      const checkCode = async () => {
        try {
          const response = await fetch(`/api/v1/coupons/check/${code}`);
          const result = await response.json();
          setStatus(result.data);
        } catch (error) {
          setStatus({ exists: false });
        }
      };

      const debounceTimer = setTimeout(checkCode, 500);
      return () => clearTimeout(debounceTimer);
    }
  }, [code]);

  if (!status) return null;

  return (
    <div className="code-status">
      {status.exists ? (
        <span className={`status ${status.isActive && !status.isExpired ? 'valid' : 'invalid'}`}>
          {status.isActive && !status.isExpired ? '✓ Valid code' : '✗ Code not available'}
        </span>
      ) : (
        <span className="status invalid">✗ Code not found</span>
      )}
    </div>
  );
};
```

---

## Integration with Checkout

### 1. Checkout Flow Integration

```tsx
const CheckoutPage = () => {
  const [cart, setCart] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [totals, setTotals] = useState({
    subtotal: 0,
    discount: 0,
    tax: 0,
    shipping: 0,
    total: 0
  });

  const handleCouponApplied = (coupon, discount) => {
    setAppliedCoupon(coupon);
    setDiscountAmount(discount);
    
    // Recalculate totals
    const newTotals = {
      ...totals,
      discount: discount,
      total: totals.subtotal - discount + totals.tax + totals.shipping
    };
    setTotals(newTotals);
  };

  const processOrder = async () => {
    const orderData = {
      items: cart,
      couponCode: appliedCoupon?.code,
      discountAmount,
      totals
    };

    // Submit order with coupon information
    const response = await fetch('/api/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(orderData)
    });

    const result = await response.json();
    if (result.success) {
      // Order successful
      window.location.href = '/order-success';
    }
  };

  return (
    <div className="checkout-page">
      <div className="order-summary">
        <h3>Order Summary</h3>
        
        {/* Cart Items */}
        {cart.map(item => (
          <CartItem key={item.id} item={item} />
        ))}

        {/* Coupon Section */}
        <div className="coupon-section">
          <h4>Discount Code</h4>
          <CouponInput
            cartTotal={totals.subtotal}
            productIds={cart.map(item => item.productId)}
            categoryIds={cart.map(item => item.categoryId)}
            onCouponApplied={handleCouponApplied}
          />
        </div>

        {/* Totals */}
        <div className="totals">
          <div className="total-line">
            <span>Subtotal:</span>
            <span>${totals.subtotal.toFixed(2)}</span>
          </div>
          
          {discountAmount > 0 && (
            <div className="total-line discount">
              <span>Discount ({appliedCoupon.code}):</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
          )}
          
          <div className="total-line">
            <span>Tax:</span>
            <span>${totals.tax.toFixed(2)}</span>
          </div>
          
          <div className="total-line">
            <span>Shipping:</span>
            <span>${totals.shipping.toFixed(2)}</span>
          </div>
          
          <div className="total-line final">
            <span>Total:</span>
            <span>${totals.total.toFixed(2)}</span>
          </div>
        </div>

        <button onClick={processOrder} className="checkout-btn">
          Place Order
        </button>
      </div>
    </div>
  );
};
```

---

## Error Handling

### Common Error Scenarios

1. **Expired Coupon**
```json
{
  "success": false,
  "message": "Coupon has expired",
  "errors": ["Coupon expired on 2024-01-01T00:00:00Z"]
}
```

2. **Usage Limit Exceeded**
```json
{
  "success": false,
  "message": "Coupon usage limit exceeded",
  "errors": ["This coupon has been used 100 times (limit: 100)"]
}
```

3. **Minimum Amount Not Met**
```json
{
  "success": false,
  "message": "Minimum order amount not met",
  "errors": ["Minimum order amount is $50.00, current cart total is $35.00"]
}
```

4. **Product/Category Restrictions**
```json
{
  "success": false,
  "message": "Coupon not applicable to cart items",
  "errors": ["This coupon is only valid for specific products/categories"]
}
```

### Error Handling Component
```tsx
const ErrorDisplay = ({ error }) => {
  if (!error) return null;

  return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <div className="error-content">
        <h4>Coupon Error</h4>
        <p>{error.message}</p>
        {error.errors && error.errors.length > 0 && (
          <ul>
            {error.errors.map((err, index) => (
              <li key={index}>{err}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
```

---

## Implementation Examples

### 1. Complete Coupon Management Interface

```tsx
import React, { useState, useEffect } from 'react';

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    type: '',
    isActive: ''
  });

  // API methods
  const api = {
    getCoupons: async (params) => {
      const query = new URLSearchParams(params);
      const response = await fetch(`/api/v1/coupons?${query}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      return response.json();
    },

    createCoupon: async (data) => {
      const response = await fetch('/api/v1/coupons', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      return response.json();
    },

    updateCoupon: async (id, data) => {
      const response = await fetch(`/api/v1/coupons/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      return response.json();
    },

    deleteCoupon: async (id) => {
      const response = await fetch(`/api/v1/coupons/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      return response.json();
    }
  };

  // Component methods
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const result = await api.getCoupons(filters);
      if (result.success) {
        setCoupons(result.data.coupons);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (couponData) => {
    try {
      const result = editingCoupon
        ? await api.updateCoupon(editingCoupon.id, couponData)
        : await api.createCoupon(couponData);

      if (result.success) {
        setShowForm(false);
        setEditingCoupon(null);
        fetchCoupons();
      }
    } catch (error) {
      console.error('Error saving coupon:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        const result = await api.deleteCoupon(id);
        if (result.success) {
          fetchCoupons();
        }
      } catch (error) {
        console.error('Error deleting coupon:', error);
      }
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [filters]);

  return (
    <div className="coupon-management">
      <div className="header">
        <h2>Coupon Management</h2>
        <button 
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          Create New Coupon
        </button>
      </div>

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search coupons..."
          value={filters.search}
          onChange={(e) => setFilters({...filters, search: e.target.value})}
        />
        <select 
          value={filters.type}
          onChange={(e) => setFilters({...filters, type: e.target.value})}
        >
          <option value="">All Types</option>
          <option value="percentage">Percentage</option>
          <option value="fixed_amount">Fixed Amount</option>
          <option value="free_shipping">Free Shipping</option>
        </select>
      </div>

      {/* Coupons Table */}
      <div className="coupons-table">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Type</th>
              <th>Value</th>
              <th>Usage</th>
              <th>Status</th>
              <th>Valid Until</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(coupon => (
              <tr key={coupon.id}>
                <td>{coupon.code}</td>
                <td>{coupon.type}</td>
                <td>
                  {coupon.type === 'percentage' ? `${coupon.value}%` : 
                   coupon.type === 'fixed_amount' ? `$${coupon.value}` : 
                   'Free Shipping'}
                </td>
                <td>
                  {coupon.usageCount}/{coupon.usageLimit || '∞'}
                </td>
                <td>
                  <span className={`status ${coupon.isActive ? 'active' : 'inactive'}`}>
                    {coupon.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{new Date(coupon.validUntil).toLocaleDateString()}</td>
                <td>
                  <button 
                    onClick={() => {
                      setEditingCoupon(coupon);
                      setShowForm(true);
                    }}
                    className="btn-edit"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(coupon.id)}
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <CouponForm
              coupon={editingCoupon}
              onSave={handleSave}
              onCancel={() => {
                setShowForm(false);
                setEditingCoupon(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManagement;
```

### 2. Customer Coupon Interface

```tsx
import React, { useState } from 'react';

const CustomerCouponInterface = ({ cart, onTotalUpdate }) => {
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const handleCouponApplied = (coupon, discount) => {
    setAppliedCoupon(coupon);
    setDiscountAmount(discount);
    onTotalUpdate({ coupon, discount });
  };

  return (
    <div className="customer-coupon-interface">
      <h3>Discount Code</h3>
      
      <CouponInput
        cartTotal={cart.total}
        productIds={cart.items.map(item => item.productId)}
        categoryIds={cart.items.map(item => item.categoryId)}
        onCouponApplied={handleCouponApplied}
      />

      {appliedCoupon && (
        <div className="applied-coupon-display">
          <div className="coupon-details">
            <h4>Applied Discount</h4>
            <p>Code: <strong>{appliedCoupon.code}</strong></p>
            <p>Discount: <strong>${discountAmount.toFixed(2)}</strong></p>
            {appliedCoupon.description && (
              <p className="description">{appliedCoupon.description}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerCouponInterface;
```

---

## Best Practices

### 1. Performance Optimization
- Implement debouncing for coupon code validation
- Cache coupon validation results temporarily
- Use pagination for large coupon lists
- Implement lazy loading for coupon statistics

### 2. User Experience
- Provide real-time feedback during validation
- Show clear error messages with actionable solutions
- Display coupon savings prominently
- Auto-uppercase coupon codes for consistency

### 3. Security Considerations
- Always validate coupons server-side
- Implement rate limiting for validation attempts
- Log coupon usage for audit trails
- Protect admin endpoints with proper authentication

### 4. Error Recovery
- Provide fallback options when validation fails
- Allow users to retry with different codes
- Show suggestions for similar valid codes
- Gracefully handle network errors

---

## Testing Guidelines

### 1. Unit Testing
```typescript
// Test coupon validation
describe('Coupon Validation', () => {
  test('validates percentage coupon correctly', async () => {
    const result = await validateCoupon('SAVE20', 100, [], []);
    expect(result.success).toBe(true);
    expect(result.discountAmount).toBe(20);
  });

  test('rejects expired coupon', async () => {
    const result = await validateCoupon('EXPIRED', 100, [], []);
    expect(result.success).toBe(false);
    expect(result.message).toContain('expired');
  });
});
```

### 2. Integration Testing
- Test complete checkout flow with coupons
- Verify coupon application and removal
- Test edge cases (minimum amounts, usage limits)
- Validate error handling scenarios

### 3. End-to-End Testing
- Test admin coupon management workflow
- Verify customer coupon application process
- Test coupon validation in different scenarios
- Validate order processing with applied coupons

---

This comprehensive guide provides everything needed to implement the coupon module frontend. The API is fully functional and ready for integration with your frontend application. 