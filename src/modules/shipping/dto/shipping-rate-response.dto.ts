import { RATE_TYPE } from '../shipping-rate.entity';

export class ShippingRateResponseDto {
  id: string;
  methodId?: string;
  method?: {
    id: string;
    name: string;
    slug: string;
  };
  rateType: RATE_TYPE;
  baseRate: number;
  additionalRate: number;
  minWeight?: number;
  maxWeight?: number;
  weightUnit?: number;
  minOrderValue?: number;
  maxOrderValue?: number;
  minDistance?: number;
  maxDistance?: number;
  distanceUnit?: number;
  firstItemCount?: number;
  additionalItemRate?: number;
  maxItems?: number;
  isActive: boolean;
  name?: string;
  description?: string;
  isFreeShipping: boolean;
  freeShippingThreshold?: number;
  appliesToAllProducts: boolean;
  productIds?: string[];
  categoryIds?: string[];
  excludedProductIds?: string[];
  excludedCategoryIds?: string[];
  validFrom?: Date;
  validTo?: Date;
  isHolidayRate: boolean;
  holidayDates?: string[];
  handlingFee: number;
  insuranceFee: number;
  signatureFee: number;
  createdAt: Date;
  updatedAt: Date;
} 