import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsEmail,
  IsUUID,
  ValidateNested,
} from "class-validator";
import { Transform, Type } from "class-transformer";
import { PAYMENT_METHOD } from "../entities/order.enums";

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

export class PaymentDataDto {
  @IsOptional()
  @IsString()
  cardNumber?: string;

  @IsOptional()
  @IsString()
  expiryMonth?: string;

  @IsOptional()
  @IsString()
  expiryYear?: string;

  @IsOptional()
  @IsString()
  cvv?: string;

  @IsOptional()
  @IsString()
  cardholderName?: string;

  @IsOptional()
  @IsString()
  paymentMethodId?: string;
}

export class ConfirmOrderDto {
  @IsString()
  checkoutId: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  guestId?: string;

  @ValidateNested()
  @Type(() => CustomerInfoDto)
  customerInfo: CustomerInfoDto;

  @IsEnum(PAYMENT_METHOD)
  paymentMethod: PAYMENT_METHOD;

  @IsOptional()
  @ValidateNested()
  @Type(() => PaymentDataDto)
  paymentData?: PaymentDataDto;

  @IsOptional()
  @IsString()
  paymentTransactionId?: string;

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }: { value: any }) => {
    if (typeof value === "string") {
      return value === "true" || value === "1";
    }
    return value;
  })
  createAccount?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }: { value: any }) => {
    if (typeof value === "string") {
      return value === "true" || value === "1";
    }
    return value;
  })
  emailNotifications?: boolean;
}
