import { IsString, IsOptional, IsBoolean, ValidateNested, IsEmail } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class GuestAddressDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsString()
  addressLine1: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  postalCode: string;

  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

export class UpdateCheckoutAddressDto {
  @IsString()
  checkoutId: string;

  @ValidateNested()
  @Type(() => GuestAddressDto)
  shippingAddress: GuestAddressDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => GuestAddressDto)
  billingAddress?: GuestAddressDto;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true' || value === '1';
    }
    return value;
  })
  billingAddressSameAsShipping?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true' || value === '1';
    }
    return value;
  })
  saveForLater?: boolean;
} 