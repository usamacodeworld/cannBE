# Guest Migration Frontend Implementation Guide

This guide explains how to implement guest-to-user migration in your frontend application, allowing guest users to create accounts and have their cart items, orders, and addresses automatically transferred.

## 🎯 **Overview**

When a guest user decides to create an account, the system will:
1. **Migrate cart items** - Transfer all active cart items to the new user account
2. **Migrate orders** - Associate all guest orders with the new user account
3. **Migrate addresses** - Save shipping/billing addresses from orders to user's address book
4. **Generate authentication tokens** - Log the user in automatically after migration

## 📋 **API Endpoints**

### Check Guest Data
```http
GET /api/guest-migration/check/:guestId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "guestData": {
      "hasCartItems": true,
      "hasOrders": true,
      "cartItemCount": 3,
      "orderCount": 2
    },
    "orderHistory": [
      {
        "id": "uuid",
        "orderNumber": "ORD-2024-123456",
        "status": "delivered",
        "totalAmount": 89.97,
        "createdAt": "2024-01-15T10:30:00Z",
        "itemCount": 2
      }
    ]
  }
}
```

### Register and Migrate
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

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "type": "buyer",
      "phone": "+1234567890",
      "emailVerified": false,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    },
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token",
    "migrationSummary": {
      "cartItemsMigrated": 3,
      "ordersMigrated": 2,
      "addressesMigrated": 2
    }
  }
}
```

## 🚀 **Frontend Implementation**

### 1. **Guest Migration Service**

```javascript
// services/guestMigrationService.js
class GuestMigrationService {
  constructor() {
    this.baseURL = '/api/guest-migration'; // Updated path to avoid NextAuth.js conflicts
  }

  async checkGuestData(guestId) {
    const response = await fetch(`${this.baseURL}/check/${guestId}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to check guest data');
    }
    
    return data.data;
  }

  async registerAndMigrate(guestId, userData) {
    const response = await fetch(`${this.baseURL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        guestId,
        ...userData
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Migration failed');
    }
    
    return data.data;
  }
}

export default new GuestMigrationService();
```

### 2. **Guest Migration Component**

```jsx
// components/GuestMigrationModal.jsx
import React, { useState, useEffect } from 'react';
import guestMigrationService from '../services/guestMigrationService';

const GuestMigrationModal = ({ guestId, isOpen, onClose, onSuccess }) => {
  const [guestData, setGuestData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: ''
  });

  useEffect(() => {
    if (isOpen && guestId) {
      checkGuestData();
    }
  }, [isOpen, guestId]);

  const checkGuestData = async () => {
    try {
      setLoading(true);
      const data = await guestMigrationService.checkGuestData(guestId);
      setGuestData(data);
    } catch (error) {
      console.error('Failed to check guest data:', error);
      // Handle error - maybe show a message that no guest data exists
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const result = await guestMigrationService.registerAndMigrate(guestId, formData);
      
      // Store authentication tokens
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('refreshToken', result.refreshToken);
      localStorage.setItem('userId', result.user.id);
      
      // Clear guest ID
      localStorage.removeItem('guestId');
      
      // Show success message
      alert(`Account created successfully! 
        - ${result.migrationSummary.cartItemsMigrated} cart items migrated
        - ${result.migrationSummary.ordersMigrated} orders migrated
        - ${result.migrationSummary.addressesMigrated} addresses migrated`);
      
      onSuccess(result);
      onClose();
      
    } catch (error) {
      console.error('Migration failed:', error);
      alert(`Migration failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Create Account & Migrate Guest Data</h2>
        
        {loading && <div className="loading">Loading...</div>}
        
        {guestData && (
          <div className="migration-preview">
            <h3>Data to be migrated:</h3>
            <ul>
              <li>🛒 {guestData.guestData.cartItemCount} cart items</li>
              <li>📦 {guestData.guestData.orderCount} orders</li>
              {guestData.orderHistory.length > 0 && (
                <li>📋 Order history will be preserved</li>
              )}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>First Name *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Last Name *</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account & Migrate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GuestMigrationModal;
```

### 3. **Integration with Checkout Flow**

```jsx
// components/Checkout.jsx
import React, { useState } from 'react';
import GuestMigrationModal from './GuestMigrationModal';

const Checkout = () => {
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const [isGuest, setIsGuest] = useState(true);
  const guestId = localStorage.getItem('guestId');

  const handleGuestCheckout = () => {
    // Proceed with guest checkout
    // ... existing guest checkout logic
  };

  const handleCreateAccount = () => {
    setShowMigrationModal(true);
  };

  const handleMigrationSuccess = (result) => {
    setIsGuest(false);
    // Refresh cart and other user-specific data
    // Redirect to user dashboard or continue checkout
  };

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>
      
      {isGuest ? (
        <div className="guest-checkout">
          <div className="guest-notice">
            <h3>Guest Checkout</h3>
            <p>You're checking out as a guest. Create an account to:</p>
            <ul>
              <li>Save your order history</li>
              <li>Track your shipments</li>
              <li>Get faster checkout next time</li>
              <li>Access exclusive deals</li>
            </ul>
            
            <button onClick={handleCreateAccount} className="btn-primary">
              Create Account & Migrate Data
            </button>
            
            <button onClick={handleGuestCheckout} className="btn-secondary">
              Continue as Guest
            </button>
          </div>
        </div>
      ) : (
        <div className="user-checkout">
          {/* User checkout flow */}
        </div>
      )}

      <GuestMigrationModal
        guestId={guestId}
        isOpen={showMigrationModal}
        onClose={() => setShowMigrationModal(false)}
        onSuccess={handleMigrationSuccess}
      />
    </div>
  );
};

export default Checkout;
```

### 4. **Cart Component with Migration Prompt**

```jsx
// components/Cart.jsx
import React, { useState, useEffect } from 'react';
import GuestMigrationModal from './GuestMigrationModal';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isGuest, setIsGuest] = useState(false);
  const [showMigrationPrompt, setShowMigrationPrompt] = useState(false);
  const guestId = localStorage.getItem('guestId');

  useEffect(() => {
    loadCart();
    checkUserStatus();
  }, []);

  const checkUserStatus = () => {
    const token = localStorage.getItem('accessToken');
    setIsGuest(!token);
    
    // Show migration prompt for guests with items in cart
    if (!token && cartItems.length > 0) {
      setShowMigrationPrompt(true);
    }
  };

  const loadCart = async () => {
    // Load cart items based on user status
    // ... existing cart loading logic
  };

  return (
    <div className="cart-container">
      <h1>Shopping Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <a href="/products" className="btn-primary">Continue Shopping</a>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {/* Cart items display */}
          </div>
          
          {showMigrationPrompt && (
            <div className="migration-prompt">
              <div className="prompt-content">
                <h3>Create an Account</h3>
                <p>Save your cart items and get faster checkout next time!</p>
                <button 
                  onClick={() => setShowMigrationPrompt(false)}
                  className="btn-primary"
                >
                  Create Account
                </button>
                <button 
                  onClick={() => setShowMigrationPrompt(false)}
                  className="btn-secondary"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          )}
          
          <div className="cart-actions">
            <a href="/checkout" className="btn-primary">
              Proceed to Checkout
            </a>
          </div>
        </>
      )}

      <GuestMigrationModal
        guestId={guestId}
        isOpen={showMigrationPrompt}
        onClose={() => setShowMigrationPrompt(false)}
        onSuccess={() => {
          setShowMigrationPrompt(false);
          setIsGuest(false);
          loadCart(); // Reload cart with user data
        }}
      />
    </div>
  );
};

export default Cart;
```

### 5. **User Context with Migration Support**

```jsx
// contexts/UserContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [guestId, setGuestId] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('accessToken');
    const storedGuestId = localStorage.getItem('guestId');
    
    if (token) {
      // User is authenticated
      setUser(JSON.parse(localStorage.getItem('user')));
      setIsGuest(false);
      setGuestId(null);
    } else if (storedGuestId) {
      // User is a guest
      setUser(null);
      setIsGuest(true);
      setGuestId(storedGuestId);
    } else {
      // No user or guest
      setUser(null);
      setIsGuest(false);
      setGuestId(null);
    }
  };

  const handleMigrationSuccess = (migrationResult) => {
    setUser(migrationResult.user);
    setIsGuest(false);
    setGuestId(null);
    
    // Update localStorage
    localStorage.setItem('user', JSON.stringify(migrationResult.user));
    localStorage.removeItem('guestId');
    
    // Trigger any necessary data refreshes
    window.dispatchEvent(new CustomEvent('userMigrated', { 
      detail: migrationResult 
    }));
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('guestId');
    
    setUser(null);
    setIsGuest(false);
    setGuestId(null);
  };

  return (
    <UserContext.Provider value={{
      user,
      isGuest,
      guestId,
      handleMigrationSuccess,
      logout,
      checkAuthStatus
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
```

## 🎨 **CSS Styles**

```css
/* Guest Migration Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.migration-preview {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.migration-preview ul {
  list-style: none;
  padding: 0;
}

.migration-preview li {
  margin: 0.5rem 0;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn-primary {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
}

/* Migration Prompt Styles */
.migration-prompt {
  background: #e3f2fd;
  border: 1px solid #2196f3;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
}

.prompt-content {
  text-align: center;
}

.prompt-content h3 {
  margin: 0 0 0.5rem 0;
  color: #1976d2;
}

.prompt-content p {
  margin: 0 0 1rem 0;
  color: #424242;
}
```

## 🔄 **Migration Flow**

1. **Guest adds items to cart** → Cart items stored with `guestId`
2. **Guest creates account** → Migration modal appears
3. **User fills registration form** → System migrates data
4. **Migration completes** → User is logged in automatically
5. **Cart refreshes** → Shows migrated items
6. **Guest ID cleared** → User now has full account access

## 🛡️ **Error Handling**

```javascript
// Error handling examples
try {
  const result = await guestMigrationService.registerAndMigrate(guestId, userData);
  // Handle success
} catch (error) {
  if (error.message.includes('already exists')) {
    // Show email already exists error
    setError('An account with this email already exists. Please login instead.');
  } else if (error.message.includes('No guest data')) {
    // Show no data to migrate
    setError('No guest data found to migrate. Please add items to cart first.');
  } else {
    // Show generic error
    setError('Account creation failed. Please try again.');
  }
}
```

This implementation provides a seamless experience for guests to create accounts while preserving their shopping data and order history. 