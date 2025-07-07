import { IsString, IsOptional, IsBoolean, IsEnum, IsArray, ValidateNested, IsNumber, IsEmail, IsUUID } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PAYMENT_METHOD } from '../entities/order.entity';
import { AddressDto, BillingAddressDto } from './shipping-address.dto';
import { CheckoutVariantDto } from './checkout-initiate.dto';

export class CustomerInfoDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class ShippingMethodDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsNumber()
  @Type(() => Number)
  price: number;

  @IsNumber()
  @Type(() => Number)
  estimatedDays: number;
}

export class OrderSummaryDto {
  @IsNumber()
  @Type(() => Number)
  subtotal: number;

  @IsNumber()
  @Type(() => Number)
  taxAmount: number;

  @IsNumber()
  @Type(() => Number)
  shippingAmount: number;

  @IsNumber()
  @Type(() => Number)
  discountAmount: number;

  @IsNumber()
  @Type(() => Number)
  totalAmount: number;
}

export class OrderItemDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  @Type(() => Number)
  quantity: number;

  @IsNumber()
  @Type(() => Number)
  unitPrice: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutVariantDto)
  selectedVariants?: CheckoutVariantDto[];
}

export class ConfirmOrderDto {
  @IsString()
  checkoutId: string;

  @ValidateNested()
  @Type(() => CustomerInfoDto)
  customerInfo: CustomerInfoDto;

  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress: AddressDto;

  @ValidateNested()
  @Type(() => BillingAddressDto)
  billingAddress: BillingAddressDto;

  @ValidateNested()
  @Type(() => ShippingMethodDto)
  shippingMethod: ShippingMethodDto;

  @IsEnum(PAYMENT_METHOD)
  paymentMethod: PAYMENT_METHOD;

  @IsOptional()
  @IsString()
  paymentTransactionId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ValidateNested()
  @Type(() => OrderSummaryDto)
  orderSummary: OrderSummaryDto;

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true' || value === '1';
    }
    return value;
  })
  createAccount?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true' || value === '1';
    }
    return value;
  })
  emailNotifications?: boolean;
} 