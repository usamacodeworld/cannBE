# Frontend Expectations: Guest vs Authenticated Users

This guide explains what the frontend should expect and implement differently for guest users versus authenticated users during the checkout process.

## Overview

The checkout system supports both guest and authenticated users, but the frontend needs to handle them differently in terms of:
- Authentication state management
- Address handling
- Session management
- Order tracking
- Account creation prompts

## Authentication Detection

### Check User Authentication Status

```javascript
// utils/auth.js
export const getAuthStatus = () => {
  const token = localStorage.getItem('accessToken');
  const user = localStorage.getItem('user');
  
  return {
    isAuthenticated: !!(token && user),
    user: user ? JSON.parse(user) : null,
    token
  };
};

export const getGuestId = () => {
  let guestId = localStorage.getItem('guestId');
  if (!guestId) {
    guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('guestId', guestId);
  }
  return guestId;
};
```

## 1. Cart Management

### For Authenticated Users:
```javascript
// Add to cart for authenticated user
const addToCartAuthenticated = async (productId, quantity, selectedVariants) => {
  const { token } = getAuthStatus();
  
  const response = await axios.post('/api/cart/add', {
    productId,
    quantity,
    selectedVariants
  }, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.data;
};
```

### For Guest Users:
```javascript
// Add to cart for guest user
const addToCartGuest = async (productId, quantity, selectedVariants) => {
  const guestId = getGuestId();
  
  const response = await axios.post('/api/cart/add', {
    guestId,
    productId,
    quantity,
    selectedVariants
  });
  
  return response.data;
};
```

## 2. Checkout Initiation

### For Authenticated Users:
```javascript
const initiateCheckoutAuthenticated = async (shippingAddressId, billingAddressId) => {
  const { token } = getAuthStatus();
  
  const response = await axios.post('/api/checkout/initiate', {
    checkoutType: 'registered',
    shippingAddressId, // Optional: Use saved address
    billingAddressId,  // Optional: Use saved address
    shippingMethod: 'standard',
    paymentMethod: 'credit_card'
  }, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.data;
};
```

### For Guest Users:
```javascript
const initiateCheckoutGuest = async () => {
  const guestId = getGuestId();
  
  const response = await axios.post('/api/checkout/initiate', {
    checkoutType: 'guest',
    guestId,
    shippingMethod: 'standard',
    paymentMethod: 'credit_card'
  });
  
  return response.data;
};
```

## 3. Address Management

### For Authenticated Users:

#### Get Saved Addresses:
```javascript
const getUserAddresses = async () => {
  const { token } = getAuthStatus();
  
  const response = await axios.get('/api/checkout/addresses', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.data.data; // { shipping: [], billing: [] }
};
```

#### Address Selection Component:
```jsx
const AuthenticatedAddressSelector = ({ onAddressSelect }) => {
  const [addresses, setAddresses] = useState({ shipping: [], billing: [] });
  const [selectedShipping, setSelectedShipping] = useState('');
  const [selectedBilling, setSelectedBilling] = useState('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const userAddresses = await getUserAddresses();
      setAddresses(userAddresses);
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const handleAddressSelection = () => {
    onAddressSelect({
      shippingAddressId: selectedShipping,
      billingAddressId: selectedBilling
    });
  };

  return (
    <div>
      <h3>Select Shipping Address</h3>
      <div className="address-options">
        {addresses.shipping.map(address => (
          <div key={address.id} className="address-option">
            <input
              type="radio"
              name="shipping"
              value={address.id}
              checked={selectedShipping === address.id}
              onChange={(e) => setSelectedShipping(e.target.value)}
            />
            <label>
              {address.firstName} {address.lastName}<br/>
              {address.addressLine1}<br/>
              {address.city}, {address.state} {address.postalCode}
            </label>
          </div>
        ))}
        <button onClick={() => setShowNewAddressForm(true)}>
          Add New Address
        </button>
      </div>

      <h3>Select Billing Address</h3>
      <div className="address-options">
        <input
          type="radio"
          name="billing"
          value="same"
          checked={selectedBilling === 'same'}
          onChange={() => setSelectedBilling('same')}
        />
        <label>Same as shipping address</label>
        
        {addresses.billing.map(address => (
          <div key={address.id} className="address-option">
            <input
              type="radio"
              name="billing"
              value={address.id}
              checked={selectedBilling === address.id}
              onChange={(e) => setSelectedBilling(e.target.value)}
            />
            <label>
              {address.firstName} {address.lastName}<br/>
              {address.addressLine1}<br/>
              {address.city}, {address.state} {address.postalCode}
            </label>
          </div>
        ))}
      </div>

      <button onClick={handleAddressSelection}>
        Continue with Selected Addresses
      </button>

      {showNewAddressForm && (
        <NewAddressForm onSave={loadAddresses} onCancel={() => setShowNewAddressForm(false)} />
      )}
    </div>
  );
};
```

### For Guest Users:

#### Address Input Component:
```jsx
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
    }
  });
  const [billingAddressSameAsShipping, setBillingAddressSameAsShipping] = useState(true);
  const [showCreateAccount, setShowCreateAccount] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      checkoutId,
      shippingAddress: addresses.shippingAddress,
      billingAddressSameAsShipping
    };

    if (!billingAddressSameAsShipping) {
      payload.billingAddress = addresses.billingAddress;
    }

    try {
      const response = await axios.put('/api/checkout/address', payload);
      onAddressUpdate(response.data.data);
      
      // Prompt guest to create account
      setShowCreateAccount(true);
    } catch (error) {
      console.error('Error updating address:', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* Address form fields */}
        <div className="shipping-address">
          <h3>Shipping Address</h3>
          {/* Form fields for shipping address */}
        </div>

        <div className="billing-address">
          <input
            type="checkbox"
            checked={billingAddressSameAsShipping}
            onChange={(e) => setBillingAddressSameAsShipping(e.target.checked)}
          />
          <label>Billing address same as shipping</label>
          
          {!billingAddressSameAsShipping && (
            <div>
              <h3>Billing Address</h3>
              {/* Form fields for billing address */}
            </div>
          )}
        </div>

        <button type="submit">Continue to Payment</button>
      </form>

      {showCreateAccount && (
        <div className="create-account-prompt">
          <h4>Want to save this address for future orders?</h4>
          <p>Create an account to save your addresses and track orders easily.</p>
          <button onClick={() => handleCreateAccount()}>Create Account</button>
          <button onClick={() => setShowCreateAccount(false)}>Continue as Guest</button>
        </div>
      )}
    </div>
  );
};
```

## 4. Order Confirmation

### For Authenticated Users:
```javascript
const confirmOrderAuthenticated = async (checkoutId, paymentData) => {
  const { token, user } = getAuthStatus();
  
  const response = await axios.post('/api/checkout/confirm-order', {
    checkoutId,
    customerInfo: {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone
    },
    paymentMethod: 'credit_card',
    paymentData
  }, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.data;
};
```

### For Guest Users:
```javascript
const confirmOrderGuest = async (checkoutId, customerInfo, paymentData) => {
  const guestId = getGuestId();
  
  const response = await axios.post('/api/checkout/confirm-order', {
    checkoutId,
    guestId,
    customerInfo, // Must be provided by guest
    paymentMethod: 'credit_card',
    paymentData,
    createAccount: false // Optional: guest can choose to create account
  });
  
  return response.data;
};
```

## 5. Order Tracking

### For Authenticated Users:
```javascript
const getOrdersAuthenticated = async () => {
  const { token } = getAuthStatus();
  
  const response = await axios.get('/api/checkout/orders', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.data.data;
};
```

### For Guest Users:
```javascript
const getOrdersGuest = async () => {
  const guestId = getGuestId();
  
  const response = await axios.get(`/api/checkout/orders?guestId=${guestId}`);
  
  return response.data.data;
};
```

## 6. Complete Checkout Components

### Main Checkout Component:
```jsx
const CheckoutPage = () => {
  const [authStatus, setAuthStatus] = useState(getAuthStatus());
  const [checkoutSession, setCheckoutSession] = useState(null);
  const [currentStep, setCurrentStep] = useState('address'); // address, payment, confirmation

  useEffect(() => {
    initiateCheckout();
  }, []);

  const initiateCheckout = async () => {
    try {
      let response;
      if (authStatus.isAuthenticated) {
        response = await initiateCheckoutAuthenticated();
      } else {
        response = await initiateCheckoutGuest();
      }
      setCheckoutSession(response.data);
    } catch (error) {
      console.error('Error initiating checkout:', error);
    }
  };

  const handleAddressUpdate = (updatedData) => {
    setCheckoutSession(updatedData.session);
    setCurrentStep('payment');
  };

  const handlePaymentComplete = async (paymentData) => {
    try {
      let response;
      if (authStatus.isAuthenticated) {
        response = await confirmOrderAuthenticated(checkoutSession.checkoutId, paymentData);
      } else {
        // For guests, collect customer info
        const customerInfo = {
          email: paymentData.email,
          firstName: paymentData.firstName,
          lastName: paymentData.lastName,
          phone: paymentData.phone
        };
        response = await confirmOrderGuest(checkoutSession.checkoutId, customerInfo, paymentData);
      }
      
      setCurrentStep('confirmation');
      // Handle successful order
    } catch (error) {
      console.error('Error confirming order:', error);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <h1>Checkout</h1>
        {!authStatus.isAuthenticated && (
          <div className="guest-notice">
            <p>Checking out as guest. <a href="/login">Sign in</a> for faster checkout.</p>
          </div>
        )}
      </div>

      {currentStep === 'address' && (
        <div className="address-step">
          {authStatus.isAuthenticated ? (
            <AuthenticatedAddressSelector onAddressSelect={handleAddressUpdate} />
          ) : (
            <GuestAddressForm 
              checkoutId={checkoutSession?.checkoutId} 
              onAddressUpdate={handleAddressUpdate} 
            />
          )}
        </div>
      )}

      {currentStep === 'payment' && (
        <PaymentForm onPaymentComplete={handlePaymentComplete} />
      )}

      {currentStep === 'confirmation' && (
        <OrderConfirmation />
      )}
    </div>
  );
};
```

## 7. State Management Patterns

### Redux/Context Pattern:
```javascript
// checkoutContext.js
const CheckoutContext = createContext();

export const CheckoutProvider = ({ children }) => {
  const [authStatus, setAuthStatus] = useState(getAuthStatus());
  const [checkoutSession, setCheckoutSession] = useState(null);
  const [guestId, setGuestId] = useState(getGuestId());

  const value = {
    authStatus,
    checkoutSession,
    guestId,
    isGuest: !authStatus.isAuthenticated,
    updateSession: setCheckoutSession
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within CheckoutProvider');
  }
  return context;
};
```

## 8. Error Handling Differences

### For Authenticated Users:
```javascript
// Handle token expiration
const handleAuthenticatedRequest = async (requestFn) => {
  try {
    return await requestFn();
  } catch (error) {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw error;
  }
};
```

### For Guest Users:
```javascript
// Handle session expiration
const handleGuestRequest = async (requestFn) => {
  try {
    return await requestFn();
  } catch (error) {
    if (error.response?.data?.error?.code === 'SESSION_NOT_FOUND') {
      // Session expired, restart checkout
      alert('Your session has expired. Please start checkout again.');
      window.location.href = '/cart';
    }
    throw error;
  }
};
```

## 9. Account Creation Flow for Guests

### During Checkout:
```jsx
const GuestAccountCreationModal = ({ isOpen, onClose, guestId, orderData }) => {
  const [formData, setFormData] = useState({
    firstName: orderData.customerInfo.firstName,
    lastName: orderData.customerInfo.lastName,
    email: orderData.customerInfo.email,
    phone: orderData.customerInfo.phone,
    password: '',
    confirmPassword: ''
  });

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('/api/guest-migration/register', {
        guestId,
        ...formData
      });
      
      // Save auth tokens
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      localStorage.removeItem('guestId');
      
      onClose();
      alert('Account created successfully! Your order and addresses have been saved.');
    } catch (error) {
      console.error('Error creating account:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>Create Account</h2>
      <p>Save your information for faster checkout next time!</p>
      
      <form onSubmit={handleCreateAccount}>
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
          required
        />
        
        <button type="submit">Create Account</button>
        <button type="button" onClick={onClose}>Skip</button>
      </form>
    </Modal>
  );
};
```

## 10. Key Differences Summary

| Feature | Authenticated Users | Guest Users |
|---------|-------------------|-------------|
| **Cart Management** | Uses userId in token | Uses guestId in localStorage |
| **Address Handling** | Select from saved addresses | Input addresses manually |
| **Session Management** | Token-based authentication | GuestId-based sessions |
| **Order Tracking** | Automatic via userId | Manual via guestId |
| **Account Creation** | Already have account | Optional during/after checkout |
| **Data Persistence** | Saved in user profile | Temporary in session |
| **Error Handling** | Token expiration → login | Session expiration → restart |
| **Security** | JWT authentication | Session-based validation |

## 11. Best Practices

### For Both User Types:
1. **Progressive Enhancement**: Start with guest flow, enhance for authenticated users
2. **Consistent UX**: Similar checkout flow regardless of authentication status
3. **Clear Indicators**: Show authentication status prominently
4. **Graceful Degradation**: Handle authentication failures gracefully
5. **Mobile Optimization**: Ensure forms work well on mobile devices

### For Guest Users:
1. **Encourage Registration**: Offer account creation at strategic points
2. **Session Management**: Handle session expiration gracefully
3. **Data Validation**: Validate guest input thoroughly
4. **Security**: Don't store sensitive data in localStorage
5. **Migration Path**: Provide easy account creation after order

### For Authenticated Users:
1. **Address Management**: Provide easy address selection/editing
2. **Default Values**: Pre-fill forms with saved information
3. **Token Management**: Handle token refresh automatically
4. **Saved Preferences**: Remember shipping/payment preferences
5. **Quick Checkout**: Offer one-click checkout for returning customers

This comprehensive guide ensures your frontend handles both guest and authenticated users appropriately, providing the best experience for each user type while maintaining security and functionality. 