# Shipping Module

A comprehensive shipping management system that allows you to create custom shipping rates based on various criteria such as zones, methods, and rates.

## Features

### 🗺️ Shipping Zones
- **Geographical Coverage**: Define zones by country, state, city, or postal code
- **Priority System**: Set zone priorities for overlapping areas
- **Zone Types**: Support for different zone types (country, state, city, postal_code, custom)
- **Active/Inactive Management**: Enable/disable zones as needed

### 🚚 Shipping Methods
- **Multiple Method Types**: Flat rate, free shipping, weight-based, price-based, distance-based
- **Carrier Types**: Standard, express, premium, economy, same-day, next-day
- **Zone Association**: Link methods to specific shipping zones
- **Default Method**: Set default shipping method
- **Additional Features**: Signature required, insurance, estimated delivery days

### 💰 Shipping Rates
- **Flexible Pricing**: Base rate + additional rate calculations
- **Multiple Rate Types**: Flat rate, weight-based, price-based, distance-based, free, item-based
- **Item-based Pricing**: Fixed rate for first few items + additional cost per item
- **Product/Category Targeting**: Apply rates to specific products or categories
- **Exclusions**: Exclude specific products or categories
- **Time-based Rates**: Set validity periods and holiday rates
- **Additional Fees**: Handling, insurance, and signature fees

## Database Schema

### ShippingZone
```typescript
{
  id: string;
  name: string;
  slug: string;
  description?: string;
  zoneType: ZONE_TYPE;
  countries?: string[];
  states?: string[];
  cities?: string[];
  postalCodes?: string[];
  isActive: boolean;
  priority: number;
  color?: string;
  methods: ShippingMethod[];
}
```

### ShippingMethod
```typescript
{
  id: string;
  name: string;
  slug: string;
  description?: string;
  methodType: METHOD_TYPE;
  carrierType: CARRIER_TYPE;
  zoneId?: string;
  zone?: ShippingZone;
  isActive: boolean;
  priority: number;
  estimatedDays?: number;
  icon?: string;
  color?: string;
  isDefault: boolean;
  requiresSignature: boolean;
  isInsured: boolean;
  insuranceAmount?: number;
  rates: ShippingRate[];
}
```

### ShippingRate
```typescript
{
  id: string;
  methodId?: string;
  method?: ShippingMethod;
  rateType: RATE_TYPE;
  baseRate: number;
  additionalRate: number;
  // Weight-based pricing
  minWeight?: number;
  maxWeight?: number;
  weightUnit?: number;
  // Price-based pricing
  minOrderValue?: number;
  maxOrderValue?: number;
  // Distance-based pricing
  minDistance?: number;
  maxDistance?: number;
  distanceUnit?: number;
  // Item-based pricing
  firstItemCount?: number;
  additionalItemRate?: number;
  maxItems?: number;
  maxShippingCost?: number;
  // Conditions
  isActive: boolean;
  priority: number;
  name?: string;
  description?: string;
  // Special conditions
  isFreeShipping: boolean;
  freeShippingThreshold?: number;
  appliesToAllProducts: boolean;
  productIds?: string[];
  categoryIds?: string[];
  excludedProductIds?: string[];
  excludedCategoryIds?: string[];
  // Time-based conditions
  validFrom?: Date;
  validTo?: Date;
  isHolidayRate: boolean;
  holidayDates?: string[];
  // Additional fees
  handlingFee: number;
  insuranceFee: number;
  signatureFee: number;
}
```

## API Endpoints

### Shipping Zones

#### Admin Routes (Protected)
- `POST /api/v1/shipping/zones/store` - Create shipping zone
- `GET /api/v1/shipping/zones/all` - Get all shipping zones (paginated)
- `GET /api/v1/shipping/zones/active` - Get active shipping zones
- `GET /api/v1/shipping/zones/match` - Find matching zone for address
- `GET /api/v1/shipping/zones/:id` - Get shipping zone by ID
- `GET /api/v1/shipping/zones/slug/:slug` - Get shipping zone by slug
- `PUT /api/v1/shipping/zones/update/:id` - Update shipping zone
- `DELETE /api/v1/shipping/zones/:id` - Delete shipping zone

### Shipping Methods

#### Admin Routes (Protected)
- `POST /api/v1/shipping/methods/store` - Create shipping method
- `GET /api/v1/shipping/methods/all` - Get all shipping methods (paginated)
- `GET /api/v1/shipping/methods/active` - Get active shipping methods
- `GET /api/v1/shipping/methods/default` - Get default shipping method
- `GET /api/v1/shipping/methods/zone/:zoneId` - Get methods by zone
- `GET /api/v1/shipping/methods/:id` - Get shipping method by ID
- `GET /api/v1/shipping/methods/slug/:slug` - Get shipping method by slug
- `PUT /api/v1/shipping/methods/update/:id` - Update shipping method
- `PUT /api/v1/shipping/methods/:id/set-default` - Set default method
- `DELETE /api/v1/shipping/methods/:id` - Delete shipping method

### Shipping Rates

#### Admin Routes (Protected)
- `POST /api/v1/shipping/rates/store` - Create shipping rate
- `GET /api/v1/shipping/rates/all` - Get all shipping rates (paginated)
- `GET /api/v1/shipping/rates/method/:methodId` - Get rates by method
- `GET /api/v1/shipping/rates/:id` - Get shipping rate by ID
- `PUT /api/v1/shipping/rates/update/:id` - Update shipping rate
- `DELETE /api/v1/shipping/rates/:id` - Delete shipping rate

#### Public Routes
- `POST /api/v1/shipping/rates/calculate` - Calculate shipping cost for single method
- `POST /api/v1/shipping/rates/calculate-multiple` - Calculate shipping costs for multiple methods

## Usage Examples

### Creating a Shipping Zone

```typescript
// Create a zone for the United States
const zoneData = {
  name: "United States",
  slug: "us",
  description: "Shipping zone for the United States",
  zoneType: "country",
  countries: ["US"],
  isActive: true,
  priority: 1
};

const zone = await shippingZoneService.create(zoneData);
```

### Creating a Shipping Method

```typescript
// Create a standard shipping method
const methodData = {
  name: "Standard Shipping",
  slug: "standard-shipping",
  description: "Standard ground shipping",
  methodType: "flat_rate",
  carrierType: "standard",
  zoneId: zoneId,
  estimatedDays: 5,
  isActive: true,
  priority: 1
};

const method = await shippingMethodService.create(methodData);
```

### Creating a Shipping Rate

```typescript
// Create a flat rate shipping
const rateData = {
  methodId: methodId,
  rateType: "flat_rate",
  baseRate: 9.99,
  additionalRate: 0,
  isActive: true,
  priority: 1,
  handlingFee: 2.00,
  insuranceFee: 0,
  signatureFee: 0
};

const rate = await shippingRateService.create(rateData);
```

### Creating an Item-Based Shipping Rate

```typescript
// Create an item-based shipping rate
// First 3 items: $5.99, each additional item: $1.50
const itemBasedRateData = {
  methodId: methodId,
  rateType: "item_based",
  baseRate: 5.99, // Rate for first few items
  firstItemCount: 3, // Number of items included in base rate
  additionalItemRate: 1.50, // Rate per additional item
  maxItems: 20, // Maximum items for this rate (optional)
  maxShippingCost: 25.00, // Maximum shipping cost cap (optional)
  isActive: true,
  priority: 1,
  handlingFee: 1.00,
  insuranceFee: 0,
  signatureFee: 0
};

const itemBasedRate = await shippingRateService.create(itemBasedRateData);
```

### Calculating Shipping Cost

```typescript
// Calculate shipping cost
const calculationParams = {
  methodId: methodId,
  weight: 2.5, // kg
  orderValue: 150.00, // USD
  itemCount: 5, // Number of items in the order
  productIds: ["product1", "product2"],
  categoryIds: ["electronics"],
  isHoliday: false
};

const result = await shippingRateService.calculateShippingCost(calculationParams);

if (result) {
  console.log(`Shipping cost: $${result.totalCost}`);
  console.log(`Breakdown:`, result.breakdown);
}
```

## Rate Calculation Logic

The shipping rate calculation follows this priority order:

1. **Zone Matching**: Find the appropriate shipping zone for the address
2. **Method Selection**: Get available shipping methods for the zone
3. **Rate Matching**: Find the best matching rate based on:
   - Product/category inclusion/exclusion
   - Weight, price, or distance ranges
   - Time validity (current date within validFrom/validTo)
   - Holiday rates
   - Priority scores
4. **Cost Calculation**: Calculate total cost including:
   - Base rate
   - Additional costs based on rate type
   - Handling, insurance, and signature fees

## Rate Types

### Flat Rate
- Fixed cost regardless of weight, price, or distance
- Example: $9.99 for any order

### Weight-Based
- Base rate + additional cost per weight unit
- Example: $5.00 base + $1.00 per kg

### Price-Based
- Base rate + percentage of order value
- Example: $3.00 base + 5% of order value

### Distance-Based
- Base rate + additional cost per distance unit
- Example: $2.00 base + $0.50 per km

### Free Shipping
- Free when order value meets threshold
- Example: Free shipping on orders over $50

### Item-Based
- Fixed rate for first few items + additional cost per item
- Example: First 3 items $5.99, each additional item $1.50
- Supports maximum item count and shipping cost caps

## Integration with Checkout

The shipping module integrates with the checkout process by:

1. **Zone Detection**: Automatically detect shipping zone based on customer address
2. **Method Selection**: Present available shipping methods to customer
3. **Cost Calculation**: Calculate shipping costs in real-time
4. **Order Integration**: Store selected shipping method and cost in order

## Permissions

The shipping module uses the following permissions:
- `MANAGE_SHIPPING`: Full access to shipping management
- `PROCESS_SHIPPING`: Process shipping orders
- `TRACK_SHIPPING`: Track shipping status

## Migration

Run the migration to create the shipping tables:

```bash
yarn migration:run
```

This will create:
- `shipping_zones` table
- `shipping_methods` table
- `shipping_rates` table
- Required indexes and foreign key constraints
- Enum types for zone, method, carrier, and rate types

## Future Enhancements

- **Real-time Carrier Integration**: Integrate with shipping carriers for real-time rates
- **Bulk Rate Import**: Import shipping rates from CSV/Excel files
- **Advanced Analytics**: Shipping cost analytics and reporting
- **Multi-currency Support**: Support for multiple currencies
- **Warehouse Management**: Multi-warehouse shipping calculations
- **International Shipping**: Enhanced international shipping support 