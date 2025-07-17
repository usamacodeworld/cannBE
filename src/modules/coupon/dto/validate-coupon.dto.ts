import { IsString, IsArray, ValidateNested, IsNumber, IsUUID, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CouponValidationItemDto {
  @IsUUID()
  productId: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsNumber()
  @Type(() => Number)
  quantity: number;

  @IsNumber()
  @Type(() => Number)
  unitPrice: number;

  @IsNumber()
  @Type(() => Number)
  totalPrice: number;
}

export class ValidateCouponDto {
  @IsString()
  couponCode: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CouponValidationItemDto)
  items: CouponValidationItemDto[];

  @IsNumber()
  @Type(() => Number)
  subtotal: number;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  userEmail?: string;
} 