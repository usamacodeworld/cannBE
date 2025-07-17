import { IsOptional, IsString, IsEnum, IsBoolean, IsUUID, IsObject } from 'class-validator';
import { Transform } from 'class-transformer';

export class CheckoutInitiateDto {
  @IsEnum(['guest', 'registered'])
  checkoutType: 'guest' | 'registered';

  @IsOptional()
  @IsString()
  guestId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  shippingAddressId?: string;

  @IsOptional()
  @IsObject()
  shippingAddress?: {
    firstName?: string;
    lastName?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
    email?: string;
  };

  @IsOptional()
  @IsUUID()
  billingAddressId?: string;

  @IsOptional()
  @IsObject()
  billingAddress?: {
    firstName?: string;
    lastName?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
    email?: string;
  };

  @IsOptional()
  @IsString()
  shippingMethod?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }: { value: any }) => {
    if (typeof value === 'string') {
      return value === 'true' || value === '1';
    }
    return value;
  })
  saveForLater?: boolean;
} 