import { IsString, IsArray, ValidateNested, IsNumber, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CouponItemDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  @Type(() => Number)
  quantity: number;

  @IsNumber()
  @Type(() => Number)
  unitPrice: number;
}

export class ApplyCouponDto {
  @IsString()
  checkoutId: string;

  @IsString()
  couponCode: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CouponItemDto)
  items: CouponItemDto[];
} 