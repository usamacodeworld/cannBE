import { COUPON_TYPE } from '../coupon.entity';

export class CouponResponseDto {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: COUPON_TYPE;
  value: number;
  minimumAmount?: number;
  maximumDiscount?: number;
  startDate?: Date;
  endDate?: Date;
  usageLimit?: number;
  usageCount: number;
  usageLimitPerUser?: number;
  isActive: boolean;
  applicableCategories?: string[];
  applicableProducts?: string[];
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Calculated fields
  remainingUses?: number;
  isExpired?: boolean;
  isValid?: boolean;
}

export class CouponValidationResponseDto {
  isValid: boolean;
  coupon?: CouponResponseDto;
  discountAmount?: number;
  message?: string;
  errors?: string[];
}

export class CouponUsageStatsDto {
  totalCoupons: number;
  activeCoupons: number;
  expiredCoupons: number;
  totalUsage: number;
  totalDiscountGiven: number;
  mostUsedCoupons: Array<{
    code: string;
    name: string;
    usageCount: number;
  }>;
} 