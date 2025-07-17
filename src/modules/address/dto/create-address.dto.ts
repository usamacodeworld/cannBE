import { IsString, IsOptional, IsEnum, IsBoolean, IsUUID, Length, IsPhoneNumber, IsEmail } from 'class-validator';
import { ADDRESS_TYPE } from '../address.entity';

export class CreateAddressDto {
  @IsEnum(ADDRESS_TYPE)
  type: ADDRESS_TYPE;

  @IsString()
  @Length(1, 100)
  firstName: string;

  @IsString()
  @Length(1, 100)
  lastName: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  company?: string;

  @IsString()
  @Length(1, 255)
  addressLine1: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  addressLine2?: string;

  @IsString()
  @Length(1, 100)
  city: string;

  @IsString()
  @Length(1, 100)
  state: string;

  @IsString()
  @Length(1, 20)
  postalCode: string;

  @IsString()
  @Length(1, 100)
  country: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
} 