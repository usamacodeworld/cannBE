import { IsString, IsOptional, IsBoolean, IsEnum, IsNumber, IsUUID, IsArray, IsDateString } from 'class-validator';
import { RATE_TYPE } from '../shipping-rate.entity';

export class UpdateShippingRateDto {
  @IsUUID()
  @IsOptional()
  methodId?: string;

  @IsEnum(RATE_TYPE)
  @IsOptional()
  rateType?: RATE_TYPE;

  @IsNumber()
  @IsOptional()
  baseRate?: number;

  @IsNumber()
  @IsOptional()
  additionalRate?: number;

  // Weight-based pricing
  @IsNumber()
  @IsOptional()
  minWeight?: number;

  @IsNumber()
  @IsOptional()
  maxWeight?: number;

  @IsNumber()
  @IsOptional()
  weightUnit?: number;

  // Price-based pricing
  @IsNumber()
  @IsOptional()
  minOrderValue?: number;

  @IsNumber()
  @IsOptional()
  maxOrderValue?: number;

  // Distance-based pricing
  @IsNumber()
  @IsOptional()
  minDistance?: number;

  @IsNumber()
  @IsOptional()
  maxDistance?: number;

  @IsNumber()
  @IsOptional()
  distanceUnit?: number;

  // Item-based pricing
  @IsNumber()
  @IsOptional()
  firstItemCount?: number;

  @IsNumber()
  @IsOptional()
  additionalItemRate?: number;

  @IsNumber()
  @IsOptional()
  maxItems?: number;

  // Conditions
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  // Special conditions
  @IsBoolean()
  @IsOptional()
  isFreeShipping?: boolean;

  @IsNumber()
  @IsOptional()
  freeShippingThreshold?: number;

  @IsBoolean()
  @IsOptional()
  appliesToAllProducts?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  productIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categoryIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  excludedProductIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  excludedCategoryIds?: string[];

  // Time-based conditions
  @IsDateString()
  @IsOptional()
  validFrom?: string;

  @IsDateString()
  @IsOptional()
  validTo?: string;

  @IsBoolean()
  @IsOptional()
  isHolidayRate?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  holidayDates?: string[];

  // Additional fees
  @IsNumber()
  @IsOptional()
  handlingFee?: number;

  @IsNumber()
  @IsOptional()
  insuranceFee?: number;

  @IsNumber()
  @IsOptional()
  signatureFee?: number;
} 