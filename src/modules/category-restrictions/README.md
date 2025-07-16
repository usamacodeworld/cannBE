# Category State Restrictions Module

This module provides a category-based approach to managing state shipping restrictions. Instead of managing restrictions for individual products, you can set restrictions at the category level, making it much more scalable for stores with hundreds or thousands of products.

## Overview

- **Category-based**: Set restrictions on product categories instead of individual products
- **State-focused**: Restrict shipping to specific US states
- **Flexible**: Support for custom messages and reasons
- **Frontend-friendly**: Complete API for admin management
- **Automatic validation**: Integrated with checkout process

## Key Features

- ✅ Restrict categories from shipping to specific states
- ✅ Custom restriction messages for better user experience
- ✅ Bulk operations for managing multiple states at once
- ✅ Active/inactive toggle without deletion
- ✅ Full CRUD operations with pagination and filtering
- ✅ Automatic validation during checkout process
- ✅ Public APIs for checking restrictions

## API Endpoints

### Public Routes (No Authentication Required)

These routes are for checking restrictions and can be used by your frontend:

#### Check Category Restriction
```
GET /api/v1/category-restrictions/check/:categoryId/:state
```
Check if a specific category is restricted in a state.

**Response:**
```json
{
  "success": true,
  "message": "Category restriction check completed",
  "data": {
    "categoryId": "cat-123",
    "state": "CA",
    "isRestricted": true,
    "isAllowed": false
  }
}
```

#### Get Restricted States for Category
```
GET /api/v1/category-restrictions/states/:categoryId
```
Get all states where a category is restricted.

**Response:**
```json
{
  "success": true,
  "message": "Restricted states retrieved successfully",
  "data": {
    "categoryId": "cat-123",
    "restrictedStates": ["CA", "NY", "WA"]
  }
}
```

#### Get Restricted Categories in State
```
GET /api/v1/category-restrictions/categories/:state
```
Get all categories restricted in a specific state.

#### Validate Products for State
```
POST /api/v1/category-restrictions/validate/:state
```
Validate multiple products for a specific state.

**Request Body:**
```json
{
  "productIds": ["prod-1", "prod-2", "prod-3"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product validation completed",
  "data": {
    "isAllowed": false,
    "restrictedCategories": [
      {
        "categoryId": "cat-123",
        "categoryName": "Electronics",
        "state": "CA",
        "reason": "Regulatory restrictions",
        "customMessage": "Electronics cannot be shipped to California due to state regulations"
      }
    ],
    "message": "1 product category(ies) are restricted in CA"
  }
}
```

#### Get US States List
```
GET /api/v1/category-restrictions/us-states
```
Get list of all US states with codes and names for dropdowns.

### Admin Routes (Authentication + Permissions Required)

These routes require authentication and appropriate permissions (`MANAGE_STORE` or `MANAGE_CATEGORIES`):

#### Create Restriction
```
POST /api/v1/category-restrictions/
```

**Request Body:**
```json
{
  "categoryId": "cat-123",
  "state": "CA",
  "isRestricted": true,
  "reason": "Regulatory restrictions",
  "customMessage": "This product category cannot be shipped to California",
  "notes": "Internal note for admin reference"
}
```

#### Get All Restrictions (with pagination/filtering)
```
GET /api/v1/category-restrictions/?page=1&limit=10&categoryId=cat-123&state=CA&isActive=true
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `categoryId`: Filter by category ID
- `state`: Filter by state
- `isRestricted`: Filter by restriction status
- `isActive`: Filter by active status
- `search`: Search in category name, reason, or custom message
- `sort`: Sort field (default: createdAt)
- `order`: Sort order (asc/desc, default: desc)

#### Update Restriction
```
PUT /api/v1/category-restrictions/:id
```

#### Delete Restriction
```
DELETE /api/v1/category-restrictions/:id
```

#### Bulk Create Restrictions
```
POST /api/v1/category-restrictions/bulk
```

**Request Body:**
```json
{
  "categoryId": "cat-123",
  "states": ["CA", "NY", "WA"],
  "isRestricted": true,
  "reason": "Regulatory restrictions",
  "customMessage": "This category cannot be shipped to these states"
}
```

## Frontend Integration Examples

### 1. Admin Management Interface

```typescript
// Get all restrictions with pagination
const getRestrictions = async (page = 1, filters = {}) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: '10',
    ...filters
  });
  
  const response = await fetch(`/api/v1/category-restrictions/?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};

// Create new restriction
const createRestriction = async (data) => {
  const response = await fetch('/api/v1/category-restrictions/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  
  return response.json();
};

// Bulk create restrictions for multiple states
const bulkCreateRestrictions = async (categoryId, states, restrictionData) => {
  const response = await fetch('/api/v1/category-restrictions/bulk', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      categoryId,
      states,
      ...restrictionData
    })
  });
  
  return response.json();
};
```

### 2. Product Display (Check Restrictions)

```typescript
// Check if products can be shipped to user's state
const checkProductsForState = async (productIds, userState) => {
  const response = await fetch(`/api/v1/category-restrictions/validate/${userState}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ productIds })
  });
  
  const result = await response.json();
  
  if (!result.data.isAllowed) {
    // Show restriction message to user
    alert(`Some products cannot be shipped to ${userState}: ${result.data.message}`);
    
    // Show specific category restrictions
    result.data.restrictedCategories.forEach(cat => {
      console.log(`${cat.categoryName}: ${cat.customMessage || cat.reason}`);
    });
  }
  
  return result.data;
};

// Check individual category restriction
const checkCategoryRestriction = async (categoryId, state) => {
  const response = await fetch(`/api/v1/category-restrictions/check/${categoryId}/${state}`);
  const result = await response.json();
  
  return result.data.isRestricted;
};
```

### 3. Checkout Integration

The system automatically validates restrictions during checkout, but you can also check beforehand:

```typescript
// Before proceeding to checkout
const validateCartForState = async (cartItems, shippingState) => {
  const productIds = cartItems.map(item => item.productId);
  
  const validation = await fetch(`/api/v1/category-restrictions/validate/${shippingState}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ productIds })
  });
  
  const result = await validation.json();
  
  if (!result.data.isAllowed) {
    // Show user which categories are restricted
    const restrictedCategories = result.data.restrictedCategories;
    
    // Display custom messages or remove restricted items
    restrictedCategories.forEach(category => {
      showRestrictionMessage(category.customMessage || category.reason);
    });
    
    return false; // Block checkout
  }
  
  return true; // Allow checkout
};
```

### 4. Admin Management UI Components

```tsx
// React component for managing restrictions
const CategoryRestrictionsManager = () => {
  const [restrictions, setRestrictions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [states, setStates] = useState([]);
  
  useEffect(() => {
    // Load initial data
    loadRestrictions();
    loadCategories();
    loadStates();
  }, []);
  
  const loadStates = async () => {
    const response = await fetch('/api/v1/category-restrictions/us-states');
    const result = await response.json();
    setStates(result.data.states);
  };
  
  const createBulkRestrictions = async (formData) => {
    const { categoryId, selectedStates, ...restrictionData } = formData;
    
    const response = await fetch('/api/v1/category-restrictions/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        categoryId,
        states: selectedStates,
        ...restrictionData
      })
    });
    
    if (response.ok) {
      loadRestrictions(); // Refresh list
      showSuccessMessage('Restrictions created successfully');
    }
  };
  
  return (
    <div>
      {/* Your admin UI here */}
      <BulkRestrictionForm 
        categories={categories}
        states={states}
        onSubmit={createBulkRestrictions}
      />
      <RestrictionsTable restrictions={restrictions} />
    </div>
  );
};
```

## Error Handling

The API returns standardized error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Category not found"
  }
}
```

Common error scenarios:
- Category not found
- Duplicate restriction (same category + state)
- Invalid state code
- Missing permissions
- Authentication required

## Database Migration

You'll need to run a migration to create the `category_state_restrictions` table. The system will handle the database setup automatically when you start the application.

## Best Practices

1. **Bulk Operations**: Use bulk creation when setting up restrictions for multiple states
2. **Custom Messages**: Provide user-friendly custom messages instead of generic reasons
3. **Active/Inactive**: Use the `isActive` flag to temporarily disable restrictions without deletion
4. **Frontend Caching**: Cache state lists and frequently checked restrictions
5. **Error Handling**: Always handle restriction errors gracefully in your checkout flow

## Use Cases

### Common Scenarios

1. **Cannabis Products**: Restrict cannabis categories from states where it's illegal
2. **Alcohol**: Restrict alcohol categories based on state shipping laws
3. **Firearms**: Restrict weapon-related categories from states with strict laws
4. **Electronics**: Restrict certain electronics from states with specific regulations
5. **Pharmaceuticals**: Restrict medical products from states requiring special licenses

### Example: Setting up Cannabis Restrictions

```typescript
// Get cannabis category ID
const cannabisCategory = await findCategoryByName("Cannabis");

// States where cannabis is illegal for recreational use
const restrictedStates = ["TX", "FL", "GA", "NC", "SC", "TN", "AL", "MS", "LA", "AR", "OK", "KS", "NE", "IA", "MO", "IN", "KY", "WV", "VA", "ID", "UT", "WY", "ND", "SD"];

// Create bulk restrictions
await bulkCreateRestrictions(cannabisCategory.id, restrictedStates, {
  reason: "Cannabis products are not legal in this state",
  customMessage: "We cannot ship cannabis products to your state due to local regulations. Please check your local laws.",
  isRestricted: true,
  isActive: true
});
```

This category-based approach is much more efficient than setting restrictions on hundreds of individual cannabis products! 