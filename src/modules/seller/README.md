# Seller Module

The seller module handles seller management, including seller registration, approval workflows, profile management, and seller-specific functionality for the e-commerce platform.

## Features

- **Seller Registration**: Users can register as sellers with business information
- **Approval Workflow**: Admin approval system for seller applications
- **Profile Management**: Comprehensive seller profile with business details
- **Status Management**: Multiple seller statuses (pending, approved, rejected, suspended)
- **Verification System**: Document verification and business verification
- **Statistics Tracking**: Sales, orders, revenue, and product statistics
- **Commission Management**: Platform commission tracking
- **Payout Integration**: Multiple payout methods support

## Entities

### Seller
Main seller entity containing all seller information including business details, status, verification, and statistics.

**Key Fields:**
- `userId`: Reference to the user account
- `businessName`: Official business name
- `businessDescription`: Business description
- `status`: Seller status (pending, approved, rejected, suspended, inactive)
- `verificationStatus`: Verification status (unverified, pending, verified, rejected)
- `totalProducts`: Number of products listed
- `totalSales`: Total sales count
- `totalRevenue`: Total revenue generated
- `commissionRate`: Platform commission percentage
- `payoutMethod`: Payment method (bank_transfer, paypal, stripe)

## API Endpoints

### Public Routes
- `POST /api/v1/sellers` - Register as a seller
- `GET /api/v1/sellers` - Get all sellers (with pagination and filters)
- `GET /api/v1/sellers/:id` - Get seller by ID
- `GET /api/v1/sellers/user/:userId` - Get seller by user ID

### Protected Routes (Requires Authentication)
- `GET /api/v1/sellers/profile/me` - Get current user's seller profile
- `PUT /api/v1/sellers/profile/me` - Update current user's seller profile
- `GET /api/v1/sellers/profile/me/stats` - Get current user's seller statistics

### Admin Routes (Requires Admin Role)
- `PUT /api/v1/sellers/:id` - Update seller (admin)
- `POST /api/v1/sellers/:id/approve` - Approve seller
- `POST /api/v1/sellers/:id/reject` - Reject seller
- `POST /api/v1/sellers/:id/suspend` - Suspend seller
- `DELETE /api/v1/sellers/:id` - Delete seller
- `GET /api/v1/sellers/:id/stats` - Get seller statistics (admin)

## Usage Examples

### Register as a Seller
```javascript
POST /api/v1/sellers
{
  "userId": "user-uuid",
  "businessName": "Green Valley Farms",
  "businessDescription": "Premium cannabis products from sustainable farming",
  "businessPhone": "+1-555-0101",
  "businessEmail": "contact@greenvalleyfarms.com",
  "businessWebsite": "https://greenvalleyfarms.com",
  "businessAddress": "123 Farm Road",
  "businessCity": "Denver",
  "businessState": "CO",
  "businessPostalCode": "80202",
  "businessCountry": "USA",
  "taxId": "TAX123456789",
  "licenseNumber": "LIC001",
  "licenseExpiryDate": "2025-12-31",
  "commissionRate": 10.0,
  "payoutMethod": "bank_transfer",
  "payoutDetails": {
    "bankName": "First National Bank",
    "accountNumber": "****1234",
    "routingNumber": "123456789"
  }
}
```

### Get Sellers with Filters
```javascript
GET /api/v1/sellers?page=1&limit=10&status=approved&businessCity=Denver&includeUser=true
```

### Update Seller Profile
```javascript
PUT /api/v1/sellers/profile/me
{
  "businessName": "Updated Business Name",
  "businessDescription": "Updated description",
  "businessPhone": "+1-555-9999"
}
```

### Approve Seller (Admin)
```javascript
POST /api/v1/sellers/seller-uuid/approve
```

### Reject Seller (Admin)
```javascript
POST /api/v1/sellers/seller-uuid/reject
{
  "rejectionReason": "Incomplete documentation provided"
}
```

## Seller Status Flow

1. **PENDING** - Seller application submitted, awaiting admin review
2. **APPROVED** - Seller approved, can list products and receive orders
3. **REJECTED** - Seller application rejected, cannot operate
4. **SUSPENDED** - Seller temporarily suspended, products hidden
5. **INACTIVE** - Seller account deactivated

## Verification Status Flow

1. **UNVERIFIED** - No verification documents submitted
2. **PENDING** - Documents submitted, under review
3. **VERIFIED** - Documents verified, seller trusted
4. **REJECTED** - Documents rejected, needs resubmission

## Integration with Products

When a seller is created, the user's type is automatically updated to 'seller'. Products can be associated with sellers through the `sellerId` field in the Product entity.

## Statistics Tracking

The seller module automatically tracks:
- Total products listed
- Total sales count
- Total orders received
- Total revenue generated
- Average rating
- Review count

## Commission System

Each seller has a configurable commission rate that determines the platform's cut from sales. This is used in the checkout process to calculate platform fees.

## Payout Methods

Supported payout methods:
- **Bank Transfer**: Direct bank account deposits
- **PayPal**: PayPal account transfers
- **Stripe**: Stripe Connect payouts

## Security Features

- Role-based access control for admin operations
- Authentication required for seller profile management
- Validation of all input data
- Secure storage of payout details

## Database Relationships

- **Seller** ↔ **User**: One-to-one relationship
- **Seller** ↔ **Product**: One-to-many relationship
- **Seller** ↔ **Order**: Indirect relationship through products

## Migration Notes

When adding the seller module to an existing system:
1. Run database migrations to create seller tables
2. Update existing products to include sellerId if needed
3. Run the seller seeder to create test data
4. Update user types for existing sellers if applicable 