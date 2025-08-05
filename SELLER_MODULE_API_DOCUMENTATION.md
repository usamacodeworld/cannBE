# Seller Module API Documentation

## Base URL
```
/api/v1/sellers
```

## Authentication
- **Public Endpoints**: No authentication required
- **Protected Endpoints**: Require JWT token in Authorization header
- **Admin Endpoints**: Require admin role

## Response Format
All endpoints return responses in the following format:
```json
{
  "code": "0",
  "message": "Success",
  "data": { ... }
}
```

---

## 1. Create Seller
**POST** `/api/v1/sellers`

**Description**: Register a new seller account

**Request Body**:
```json
{
  "userId": "string (required)",
  "businessName": "string (optional)",
  "businessDescription": "string (optional)",
  "businessPhone": "string (optional)",
  "businessEmail": "email (optional)",
  "businessWebsite": "string (optional)",
  "businessAddress": "string (optional)",
  "businessCity": "string (optional)",
  "businessState": "string (optional)",
  "businessPostalCode": "string (optional)",
  "businessCountry": "string (optional)",
  "taxId": "string (optional)",
  "licenseNumber": "string (optional)",
  "licenseExpiryDate": "YYYY-MM-DD (optional)",
  "status": "pending|approved|rejected|suspended|inactive (optional, default: pending)",
  "verificationStatus": "unverified|pending|verified|rejected (optional, default: unverified)",
  "verificationDocuments": "string (optional)",
  "profileImage": "string (optional)",
  "bannerImage": "string (optional)",
  "commissionRate": "number (optional)",
  "payoutMethod": "string (optional)",
  "payoutDetails": "string (optional)",
  "notes": "string (optional)"
}
```

**Example Request**:
```json
{
  "userId": "user_123",
  "businessName": "ABC Electronics",
  "businessDescription": "Premium electronics retailer",
  "businessPhone": "+1234567890",
  "businessEmail": "contact@abcelectronics.com",
  "businessWebsite": "https://abcelectronics.com",
  "businessAddress": "123 Main St",
  "businessCity": "New York",
  "businessState": "NY",
  "businessPostalCode": "10001",
  "businessCountry": "USA",
  "taxId": "TAX123456",
  "licenseNumber": "LIC789012",
  "licenseExpiryDate": "2025-12-31",
  "commissionRate": 10.5
}
```

**Response**:
```json
{
  "code": "0",
  "message": "Success",
  "data": {
    "id": "seller_456",
    "userId": "user_123",
    "businessName": "ABC Electronics",
    "status": "pending",
    "verificationStatus": "unverified",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## 2. Get All Sellers
**GET** `/api/v1/sellers`

**Description**: Retrieve all sellers with pagination and filtering

**Query Parameters**:
```
page: number (optional, default: 1)
limit: number (optional, default: 10)
search: string (optional) - Search in business name and description
status: pending|approved|rejected|suspended|inactive (optional)
verificationStatus: unverified|pending|verified|rejected (optional)
businessCity: string (optional)
businessState: string (optional)
businessCountry: string (optional)
includeUser: boolean (optional, default: false)
includeProducts: boolean (optional, default: false)
```

**Example Request**:
```
GET /api/v1/sellers?page=1&limit=20&status=approved&includeUser=true
```

**Response**:
```json
{
  "code": "0",
  "message": "Success",
  "data": {
    "items": [
      {
        "id": "seller_456",
        "userId": "user_123",
        "businessName": "ABC Electronics",
        "businessDescription": "Premium electronics retailer",
        "status": "approved",
        "verificationStatus": "verified",
        "totalProducts": 25,
        "totalSales": 150,
        "totalOrders": 75,
        "totalRevenue": 15000.00,
        "rating": 4.5,
        "reviewCount": 45,
        "createdAt": "2024-01-15T10:30:00Z",
        "user": {
          "id": "user_123",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com"
        }
      }
    ],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

---

## 3. Get Seller by ID
**GET** `/api/v1/sellers/:id`

**Description**: Retrieve a specific seller by their ID

**Path Parameters**:
```
id: string (required) - Seller ID
```

**Query Parameters**:
```
includeUser: boolean (optional, default: false)
includeProducts: boolean (optional, default: false)
```

**Example Request**:
```
GET /api/v1/sellers/seller_456?includeUser=true&includeProducts=true
```

**Response**:
```json
{
  "code": "0",
  "message": "Success",
  "data": {
    "id": "seller_456",
    "userId": "user_123",
    "businessName": "ABC Electronics",
    "businessDescription": "Premium electronics retailer",
    "businessPhone": "+1234567890",
    "businessEmail": "contact@abcelectronics.com",
    "businessWebsite": "https://abcelectronics.com",
    "businessAddress": "123 Main St",
    "businessCity": "New York",
    "businessState": "NY",
    "businessPostalCode": "10001",
    "businessCountry": "USA",
    "taxId": "TAX123456",
    "licenseNumber": "LIC789012",
    "licenseExpiryDate": "2025-12-31T00:00:00Z",
    "status": "approved",
    "verificationStatus": "verified",
    "profileImage": "https://example.com/profile.jpg",
    "bannerImage": "https://example.com/banner.jpg",
    "totalProducts": 25,
    "totalSales": 150,
    "totalOrders": 75,
    "totalRevenue": 15000.00,
    "rating": 4.5,
    "reviewCount": 45,
    "commissionRate": 10.5,
    "payoutMethod": "bank_transfer",
    "payoutDetails": "{\"accountNumber\":\"1234567890\",\"bankName\":\"Example Bank\"}",
    "approvedAt": "2024-01-20T15:30:00Z",
    "approvedBy": "admin_123",
    "notes": "Reliable seller with good track record",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T15:30:00Z",
    "user": {
      "id": "user_123",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "isActive": true
    }
  }
}
```

---

## 4. Get Seller by User ID
**GET** `/api/v1/sellers/user/:userId`

**Description**: Retrieve seller information by user ID

**Path Parameters**:
```
userId: string (required) - User ID
```

**Example Request**:
```
GET /api/v1/sellers/user/user_123
```

**Response**: Same as Get Seller by ID

---

## 5. Update Seller
**PUT** `/api/v1/sellers/:id`

**Description**: Update seller information (Admin only)

**Path Parameters**:
```
id: string (required) - Seller ID
```

**Request Body**: Same as Create Seller (all fields optional)

**Example Request**:
```json
{
  "businessName": "ABC Electronics Updated",
  "businessDescription": "Updated description",
  "commissionRate": 12.0
}
```

**Response**: Updated seller object

---

## 6. Update My Seller Profile
**PUT** `/api/v1/sellers/profile/me`

**Description**: Update current user's seller profile (Protected route)

**Request Body**: Same as Create Seller (all fields optional)

**Headers**:
```
Authorization: Bearer <jwt_token>
```

---

## 7. Get My Seller Profile
**GET** `/api/v1/sellers/profile/me`

**Description**: Get current user's seller profile (Protected route)

**Headers**:
```
Authorization: Bearer <jwt_token>
```

---

## 8. Get Seller Statistics
**GET** `/api/v1/sellers/:id/stats`

**Description**: Get detailed statistics for a seller (Admin only)

**Path Parameters**:
```
id: string (required) - Seller ID
```

**Response**:
```json
{
  "code": "0",
  "message": "Success",
  "data": {
    "totalProducts": 25,
    "totalSales": 150,
    "totalOrders": 75,
    "totalRevenue": 15000.00,
    "averageOrderValue": 200.00,
    "rating": 4.5,
    "reviewCount": 45,
    "monthlyStats": [
      {
        "month": "2024-01",
        "orders": 15,
        "revenue": 3000.00
      }
    ]
  }
}
```

---

## 9. Get My Seller Statistics
**GET** `/api/v1/sellers/profile/me/stats`

**Description**: Get current user's seller statistics (Protected route)

**Headers**:
```
Authorization: Bearer <jwt_token>
```

---

## 10. Approve Seller
**POST** `/api/v1/sellers/:id/approve`

**Description**: Approve a seller account (Admin only)

**Path Parameters**:
```
id: string (required) - Seller ID
```

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response**:
```json
{
  "code": "0",
  "message": "Success",
  "data": {
    "id": "seller_456",
    "status": "approved",
    "approvedAt": "2024-01-20T15:30:00Z",
    "approvedBy": "admin_123"
  }
}
```

---

## 11. Reject Seller
**POST** `/api/v1/sellers/:id/reject`

**Description**: Reject a seller account (Admin only)

**Path Parameters**:
```
id: string (required) - Seller ID
```

**Request Body**:
```json
{
  "rejectionReason": "string (required)"
}
```

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Example Request**:
```json
{
  "rejectionReason": "Incomplete documentation provided"
}
```

---

## 12. Suspend Seller
**POST** `/api/v1/sellers/:id/suspend`

**Description**: Suspend a seller account (Admin only)

**Path Parameters**:
```
id: string (required) - Seller ID
```

**Request Body**:
```json
{
  "reason": "string (required)"
}
```

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Example Request**:
```json
{
  "reason": "Violation of platform policies"
}
```

---

## 13. Delete Seller
**DELETE** `/api/v1/sellers/:id`

**Description**: Delete a seller account (Admin only)

**Path Parameters**:
```
id: string (required) - Seller ID
```

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response**:
```json
{
  "code": "0",
  "message": "Success",
  "data": {
    "message": "Seller deleted successfully"
  }
}
```

---

## 14. Sync All Seller Product Counts
**POST** `/api/v1/sellers/sync-product-counts`

**Description**: Manually sync all sellers' product counts (Admin only)
**Note**: This endpoint is useful for fixing discrepancies or after bulk operations

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response**:
```json
{
  "code": "0",
  "message": "Success",
  "data": {
    "message": "All seller product counts synced successfully"
  }
}
```

---

## Status Enums

### SELLER_STATUS
- `pending` - Awaiting approval
- `approved` - Approved and active
- `rejected` - Rejected by admin
- `suspended` - Temporarily suspended
- `inactive` - Inactive seller

### SELLER_VERIFICATION_STATUS
- `unverified` - Not yet verified
- `pending` - Verification in progress
- `verified` - Successfully verified
- `rejected` - Verification rejected

---

## Error Responses

### 400 Bad Request
```json
{
  "code": "400",
  "message": "Validation error",
  "errors": [
    {
      "field": "businessEmail",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "code": "401",
  "message": "Unauthorized access"
}
```

### 403 Forbidden
```json
{
  "code": "403",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "code": "404",
  "message": "Seller not found"
}
```

### 500 Internal Server Error
```json
{
  "code": "500",
  "message": "Internal server error"
}
```

---

## Frontend Integration Notes

1. **Authentication**: Use JWT tokens for protected routes
2. **File Uploads**: For profile/banner images, use the media upload endpoint first, then pass the returned URL
3. **Pagination**: Always include page and limit parameters for list endpoints
4. **Error Handling**: Check the response code and handle errors appropriately
5. **Real-time Updates**: Consider implementing WebSocket connections for real-time status updates
6. **Form Validation**: Implement client-side validation matching the DTO requirements 