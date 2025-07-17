import { IsOptional, IsString, IsBoolean, IsEnum, IsDateString, IsUUID } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { COUPON_TYPE } from '../coupon.entity';

export class GetCouponsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (typeof value === 'string' && (value === '' || value === 'undefined' || value === 'null')) {
      return undefined;
    }
    return value;
  })
  search?: string; // Search in code, name, or description

  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (typeof value === 'string' && (value === '' || value === 'undefined' || value === 'null')) {
      return undefined;
    }
    return value;
  })
  code?: string; // Filter by specific coupon code

  @IsOptional()
  @IsEnum(COUPON_TYPE)
  @Transform(({ value }) => {
    if (typeof value === 'string' && (value === '' || value === 'undefined' || value === 'null')) {
      return undefined;
    }
    return value;
  })
  type?: COUPON_TYPE; // Filter by coupon type

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      if (value === '' || value === 'undefined' || value === 'null') {
        return undefined;
      }
      return value === 'true' || value === '1';
    }
    return value;
  })
  isActive?: boolean; // Filter by active status

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      if (value === '' || value === 'undefined' || value === 'null') {
        return undefined;
      }
      return value === 'true' || value === '1';
    }
    return value;
  })
  isExpired?: boolean; // Filter by expiration status

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      if (value === '' || value === 'undefined' || value === 'null') {
        return undefined;
      }
      return value === 'true' || value === '1';
    }
    return value;
  })
  hasUsageLimit?: boolean; // Filter coupons with usage limits

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => {
    if (typeof value === 'string' && (value === '' || value === 'undefined' || value === 'null')) {
      return undefined;
    }
    return value;
  })
  startDateFrom?: string; // Filter coupons starting from this date

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => {
    if (typeof value === 'string' && (value === '' || value === 'undefined' || value === 'null')) {
      return undefined;
    }
    return value;
  })
  startDateTo?: string; // Filter coupons starting before this date

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => {
    if (typeof value === 'string' && (value === '' || value === 'undefined' || value === 'null')) {
      return undefined;
    }
    return value;
  })
  endDateFrom?: string; // Filter coupons ending from this date

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => {
    if (typeof value === 'string' && (value === '' || value === 'undefined' || value === 'null')) {
      return undefined;
    }
    return value;
  })
  endDateTo?: string; // Filter coupons ending before this date

  @IsOptional()
  @IsUUID()
  @Transform(({ value }) => {
    if (typeof value === 'string' && (value === '' || value === 'undefined' || value === 'null')) {
      return undefined;
    }
    return value;
  })
  createdBy?: string; // Filter by creator

  @IsOptional()
  @IsUUID()
  @Transform(({ value }) => {
    if (typeof value === 'string' && (value === '' || value === 'undefined' || value === 'null')) {
      return undefined;
    }
    return value;
  })
  categoryId?: string; // Filter coupons applicable to specific category

  @IsOptional()
  @IsUUID()
  @Transform(({ value }) => {
    if (typeof value === 'string' && (value === '' || value === 'undefined' || value === 'null')) {
      return undefined;
    }
    return value;
  })
  productId?: string; // Filter coupons applicable to specific product
} 