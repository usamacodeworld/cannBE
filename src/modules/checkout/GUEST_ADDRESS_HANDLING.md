# Guest Address Handling Guide

This guide explains how to handle addresses for guest users during the checkout process.

## Overview

Guest users don't have saved addresses in their profile, so addresses must be collected and managed during the checkout session. The system provides several ways to handle guest addresses:

1. **Direct Address Input**: Guests provide addresses during checkout
2. **Session Storage**: Addresses are stored in the checkout session
3. **Address Validation**: Addresses are validated for shipping and tax calculation
4. **Order Storage**: Addresses are saved with the order for fulfillment

## Guest Address Flow

### 1. Initiate Checkout (No Addresses)
```javascript
POST /api/checkout/initiate
{
  "guestId": "guest_123",
  "shippingMethod": "standard",
  "paymentMethod": "credit_card"
}
```

### 2. Update Checkout Address
```javascript
PUT /api/checkout/address
{
  "checkoutId": "checkout_123",
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "addressLine1": "123 Main St",
    "addressLine2": "Apt 4B",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "US",
    "phone": "+1234567890",
    "email": "john@example.com"
  },
  "billingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "addressLine1": "456 Oak Ave",
    "city": "New York",
    "state": "NY",
    "postalCode": "10002",
    "country": "US",
    "phone": "+1234567890",
    "email": "john@example.com"
  },
  "billingAddressSameAsShipping": false
}
```

### 3. Alternative: Same Billing Address
```javascript
PUT /api/checkout/address
{
  "checkoutId": "checkout_123",
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "addressLine1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "US",
    "phone": "+1234567890",
    "email": "john@example.com"
  },
  "billingAddressSameAsShipping": true
}
```

### 4. Get Updated Session
```javascript
GET /api/checkout/session/checkout_123

Response:
{
  "success": true,
  "data": {
    "checkoutId": "checkout_123",
    "items": [...],
    "shippingAddress": {
      "firstName": "John",
      "lastName": "Doe",
      "addressLine1": "123 Main St",
      // ... full address
    },
    "billingAddress": {
      // ... billing address
    },
    "summary": {
      "subtotal": 100.00,
      "taxAmount": 8.50,
      "shippingAmount": 9.99,
      "totalAmount": 118.49
    }
  }
}
```

### 5. Confirm Order
```javascript
POST /api/checkout/confirm-order
{
  "checkoutId": "checkout_123",
  "guestId": "guest_123",
  "customerInfo": {
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  },
  "paymentMethod": "credit_card",
  "paymentData": {
    "cardNumber": "4111111111111111",
    "expiryMonth": "12",
    "expiryYear": "2025",
    "cvv": "123",
    "cardholderName": "John Doe"
  }
}
```

## Frontend Implementation

### React Example - Address Form Component

```jsx
import React, { useState } from 'react';
import axios from 'axios';

const GuestAddressForm = ({ checkoutId, onAddressUpdate }) => {
  const [addresses, setAddresses] = useState({
    shippingAddress: {
      firstName: '',
      lastName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
      phone: '',
      email: ''
    },
    billingAddress: {
      firstName: '',
      lastName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
      phone: '',
      email: ''
    }
  });

  const [billingAddressSameAsShipping, setBillingAddressSameAsShipping] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        checkoutId,
        shippingAddress: addresses.shippingAddress,
        billingAddressSameAsShipping
      };

      if (!billingAddressSameAsShipping) {
        payload.billingAddress = addresses.billingAddress;
      }

      const response = await axios.put('/api/checkout/address', payload);
      
      if (response.data.success) {
        onAddressUpdate(response.data.data);
        alert('Address updated successfully!');
      }
    } catch (error) {
      console.error('Error updating address:', error);
      alert('Failed to update address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShippingChange = (field, value) => {
    setAddresses(prev => ({
      ...prev,
      shippingAddress: {
        ...prev.shippingAddress,
        [field]: value
      }
    }));
  };

  const handleBillingChange = (field, value) => {
    setAddresses(prev => ({
      ...prev,
      billingAddress: {
        ...prev.billingAddress,
        [field]: value
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Shipping Address */}
      <div>
        <h3 className="text-lg font-medium mb-4">Shipping Address</h3>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="First Name"
            value={addresses.shippingAddress.firstName}
            onChange={(e) => handleShippingChange('firstName', e.target.value)}
            required
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={addresses.shippingAddress.lastName}
            onChange={(e) => handleShippingChange('lastName', e.target.value)}
            required
            className="border rounded px-3 py-2"
          />
        </div>
        
        <input
          type="text"
          placeholder="Address Line 1"
          value={addresses.shippingAddress.addressLine1}
          onChange={(e) => handleShippingChange('addressLine1', e.target.value)}
          required
          className="border rounded px-3 py-2 w-full mt-2"
        />
        
        <input
          type="text"
          placeholder="Address Line 2 (Optional)"
          value={addresses.shippingAddress.addressLine2}
          onChange={(e) => handleShippingChange('addressLine2', e.target.value)}
          className="border rounded px-3 py-2 w-full mt-2"
        />
        
        <div className="grid grid-cols-3 gap-4 mt-2">
          <input
            type="text"
            placeholder="City"
            value={addresses.shippingAddress.city}
            onChange={(e) => handleShippingChange('city', e.target.value)}
            required
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="State"
            value={addresses.shippingAddress.state}
            onChange={(e) => handleShippingChange('state', e.target.value)}
            required
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="Postal Code"
            value={addresses.shippingAddress.postalCode}
            onChange={(e) => handleShippingChange('postalCode', e.target.value)}
            required
            className="border rounded px-3 py-2"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-2">
          <input
            type="tel"
            placeholder="Phone"
            value={addresses.shippingAddress.phone}
            onChange={(e) => handleShippingChange('phone', e.target.value)}
            className="border rounded px-3 py-2"
          />
          <input
            type="email"
            placeholder="Email"
            value={addresses.shippingAddress.email}
            onChange={(e) => handleShippingChange('email', e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>
      </div>

      {/* Billing Address */}
      <div>
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="sameAsShipping"
            checked={billingAddressSameAsShipping}
            onChange={(e) => setBillingAddressSameAsShipping(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="sameAsShipping">Billing address same as shipping</label>
        </div>

        {!billingAddressSameAsShipping && (
          <div>
            <h3 className="text-lg font-medium mb-4">Billing Address</h3>
            {/* Similar form fields for billing address */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                value={addresses.billingAddress.firstName}
                onChange={(e) => handleBillingChange('firstName', e.target.value)}
                required
                className="border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={addresses.billingAddress.lastName}
                onChange={(e) => handleBillingChange('lastName', e.target.value)}
                required
                className="border rounded px-3 py-2"
              />
            </div>
            {/* Add remaining billing address fields similar to shipping */}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Updating...' : 'Update Address'}
      </button>
    </form>
  );
};

export default GuestAddressForm;
```

### Using the Component

```jsx
import React, { useState, useEffect } from 'react';
import GuestAddressForm from './GuestAddressForm';

const CheckoutPage = ({ checkoutId }) => {
  const [session, setSession] = useState(null);

  const fetchSession = async () => {
    try {
      const response = await axios.get(`/api/checkout/session/${checkoutId}`);
      setSession(response.data.data);
    } catch (error) {
      console.error('Error fetching session:', error);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [checkoutId]);

  const handleAddressUpdate = (updatedData) => {
    setSession(updatedData.session);
    // Update shipping methods, tax, etc.
  };

  return (
    <div>
      <h1>Checkout</h1>
      
      {session && (
        <div>
          <h2>Order Summary</h2>
          <p>Subtotal: ${session.summary.subtotal}</p>
          <p>Tax: ${session.summary.taxAmount}</p>
          <p>Shipping: ${session.summary.shippingAmount}</p>
          <p>Total: ${session.summary.totalAmount}</p>
        </div>
      )}

      <GuestAddressForm 
        checkoutId={checkoutId} 
        onAddressUpdate={handleAddressUpdate}
      />
    </div>
  );
};
```

## Key Features

### 1. **Address Validation**
- Addresses are validated when updated
- Shipping and tax are recalculated based on the new address
- Invalid addresses return validation errors

### 2. **Session Management**
- Addresses are stored in the checkout session (Redis)
- Session expires after 30 minutes
- Addresses persist across page refreshes

### 3. **Billing Address Options**
- Same as shipping address (default)
- Different billing address
- Automatic fallback to shipping if billing not provided

### 4. **Real-time Updates**
- Shipping methods updated when address changes
- Tax calculation updated automatically
- Order summary recalculated

### 5. **Order Integration**
- Addresses are saved with the order
- Used for shipping label generation
- Available for customer service

## Error Handling

Common errors and solutions:

```javascript
// Session not found
{
  "success": false,
  "error": {
    "code": "SESSION_NOT_FOUND",
    "message": "Checkout session not found or expired"
  }
}

// Invalid address format
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid address format",
    "details": {
      "postalCode": "Invalid postal code format"
    }
  }
}

// Shipping calculation failed
{
  "success": false,
  "error": {
    "code": "SHIPPING_CALCULATION_FAILED",
    "message": "Unable to calculate shipping for this address"
  }
}
```

## Best Practices

1. **Validate Early**: Validate addresses as soon as they're entered
2. **Auto-complete**: Use address auto-complete services
3. **Save Progress**: Save address changes immediately
4. **Clear Feedback**: Show loading states and success/error messages
5. **Mobile Friendly**: Ensure forms work well on mobile devices
6. **Security**: Never store payment info in session, only addresses

## Migration Support

When guests create accounts, their addresses can be migrated:

```javascript
// The guest migration service will automatically save addresses
// from orders to the user's address book
POST /api/guest-migration/register
{
  "guestId": "guest_123",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

This ensures a seamless transition from guest to registered user. 