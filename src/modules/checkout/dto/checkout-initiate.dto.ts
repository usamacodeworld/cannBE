import { IsOptional, IsString, IsEnum, IsBoolean, IsUUID } from 'class-validator';
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
  @IsUUID()
  billingAddressId?: string;

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