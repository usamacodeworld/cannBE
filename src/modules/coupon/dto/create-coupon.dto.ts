import { IsString, IsEnum, IsNumber, IsBoolean, IsOptional, IsDateString, IsArray, Min, Max, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { COUPON_TYPE } from '../coupon.entity';

export class CreateCouponDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(COUPON_TYPE)
  type: COUPON_TYPE;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  value: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  minimumAmount?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  maximumDiscount?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  usageLimit?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  usageLimitPerUser?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @IsOptional()
  @IsUUID(4, { each: true })
  @IsArray()
  applicableCategories?: string[];

  @IsOptional()
  @IsUUID(4, { each: true })
  @IsArray()
  applicableProducts?: string[];

  @IsOptional()
  @IsUUID()
  createdBy?: string;
} 