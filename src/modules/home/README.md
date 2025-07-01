# Home Module

The Home module provides APIs for the home page with chunked data loading support. It includes endpoints for featured products, new arrivals, popular categories, trending products, and deals.

## API Endpoints

### 1. Get Home Data (All Sections)
**GET** `/api/v1/home`

Returns all home page sections in a single API call.

#### Query Parameters
- `featuredProductsLimit` (optional): Number of featured products to return (1-20, default: 8)
- `newArrivalsLimit` (optional): Number of new arrivals to return (1-20, default: 6)
- `popularCategoriesLimit` (optional): Number of popular categories to return (1-20, default: 6)
- `trendingProductsLimit` (optional): Number of trending products to return (1-20, default: 4)
- `dealsLimit` (optional): Number of deals to return (1-20, default: 4)

#### Example Request
```bash
GET /api/v1/home?featuredProductsLimit=10&newArrivalsLimit=8&dealsLimit=6
```

#### Response
```json
{
  "message": "Home data retrieved successfully",
  "requestId": "uuid",
  "data": {
    "featuredProducts": [...],
    "newArrivals": [...],
    "popularCategories": [...],
    "trendingProducts": [...],
    "deals": [...],
    "meta": {
      "featuredProductsCount": 8,
      "newArrivalsCount": 6,
      "popularCategoriesCount": 6,
      "trendingProductsCount": 4,
      "dealsCount": 4
    }
  },
  "code": 0
}
```

### 2. Get Featured Products (Chunked)
**GET** `/api/v1/home/featured-products`

Returns featured products with pagination support for chunked loading.

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (1-50, default: 12)

#### Example Request
```bash
GET /api/v1/home/featured-products?page=1&limit=12
```

#### Response
```json
{
  "message": "Featured products retrieved successfully",
  "requestId": "uuid",
  "data": {
    "data": [
      {
        "id": "product-id",
        "name": "Product Name",
        "slug": "product-slug",
        "shortDescription": "Product description",
        "regularPrice": 1199.99,
        "salePrice": 1099.99,
        "discount": 8.33,
        "discountType": "percentage",
        "rating": 4.5,
        "numOfSales": 150,
        "stock": 50,
        "thumbnailImgId": "thumbnail-id",
        "thumbnailImg": {
          "id": "media-id",
          "scope": "products",
          "uri": "/path/to/image",
          "url": "https://cdn.example.com/image.jpg",
          "fileName": "product-thumbnail.jpg",
          "mimetype": "image/jpeg",
          "size": 102400,
          "userId": "user-id",
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        },
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "meta": {
      "total": 25,
      "page": 1,
      "limit": 12,
      "totalPages": 3
    }
  },
  "code": 0
}
```

### 3. Get New Arrivals (Chunked)
**GET** `/api/v1/home/new-arrivals`

Returns newest products with pagination support.

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (1-50, default: 12)

#### Example Request
```bash
GET /api/v1/home/new-arrivals?page=2&limit=8
```

### 4. Get Deals (Chunked)
**GET** `/api/v1/home/deals`

Returns products with active discounts/deals.

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (1-50, default: 12)

#### Example Request
```bash
GET /api/v1/home/deals?page=1&limit=10
```

#### Response (includes deal-specific fields)
```json
{
  "message": "Deals retrieved successfully",
  "requestId": "uuid",
  "data": {
    "data": [
      {
        "id": "product-id",
        "name": "Product Name",
        "slug": "product-slug",
        "shortDescription": "Product description",
        "regularPrice": 1199.99,
        "salePrice": 899.99,
        "discount": 25.0,
        "discountType": "percentage",
        "discountStartDate": "2024-01-01T00:00:00.000Z",
        "discountEndDate": "2024-12-31T23:59:59.000Z",
        "rating": 4.5,
        "numOfSales": 150,
        "stock": 50,
        "thumbnailImgId": "thumbnail-id",
        "thumbnailImg": {...},
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "meta": {
      "total": 15,
      "page": 1,
      "limit": 10,
      "totalPages": 2
    }
  },
  "code": 0
}
```

## Data Models

### Product Summary
```typescript
{
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  regularPrice: number;
  salePrice: number;
  discount: number;
  discountType: string;
  rating: number;
  numOfSales: number;
  stock: number;
  thumbnailImgId: string;
  thumbnailImg?: MediaFile | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### Category Summary
```typescript
{
  id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  parentId: string | null;
  thumbnailImageId: string | null;
  thumbnailImage?: MediaFile | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### Media File
```typescript
{
  id: string;
  scope: string;
  uri: string;
  url: string;
  fileName: string;
  mimetype: string;
  size: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Features

### Chunked Loading
- All endpoints support pagination for efficient data loading
- Configurable limits for each section
- Progressive loading for better performance

### Image Support
- Automatic thumbnail image loading
- Full media file information included
- Null handling for missing images

### Filtering & Sorting
- Featured products: Sorted by sales and creation date
- New arrivals: Sorted by creation date (newest first)
- Trending products: Sorted by sales and rating (4.0+ rating)
- Deals: Sorted by discount percentage and sales
- Popular categories: Sorted by update date

### Data Validation
- Input validation for all query parameters
- Proper error handling and responses
- Type safety with TypeScript

## Usage Examples

### Frontend Implementation
```javascript
// Load initial home data
const homeData = await fetch('/api/v1/home?featuredProductsLimit=8&newArrivalsLimit=6');

// Load more featured products
const moreFeatured = await fetch('/api/v1/home/featured-products?page=2&limit=12');

// Load deals
const deals = await fetch('/api/v1/home/deals?page=1&limit=8');
```

### React Hook Example
```javascript
const useHomeData = (limits = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const params = new URLSearchParams(limits);
      const response = await fetch(`/api/v1/home?${params}`);
      const result = await response.json();
      setData(result.data);
      setLoading(false);
    };
    fetchData();
  }, [limits]);

  return { data, loading };
};
``` 