import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsDateString,
  IsNumber,
} from "class-validator";
import { Transform } from "class-transformer";
import {
  SELLER_STATUS,
  SELLER_VERIFICATION_STATUS,
} from "../entities/seller.entity";

export class UpdateSellerDto {
  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  businessDescription?: string;

  @IsOptional()
  @IsString()
  businessPhone?: string;

  @IsOptional()
  @IsEmail()
  businessEmail?: string;

  @IsOptional()
  @IsString()
  businessWebsite?: string;

  @IsOptional()
  @IsString()
  businessAddress?: string;

  @IsOptional()
  @IsString()
  businessCity?: string;

  @IsOptional()
  @IsString()
  businessState?: string;

  @IsOptional()
  @IsString()
  businessPostalCode?: string;

  @IsOptional()
  @IsString()
  businessCountry?: string;

  @IsOptional()
  @IsString()
  taxId?: string;

  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsOptional()
  @IsDateString()
  licenseExpiryDate?: string;

  @IsOptional()
  @IsEnum(SELLER_STATUS)
  status?: SELLER_STATUS;

  @IsOptional()
  @IsEnum(SELLER_VERIFICATION_STATUS)
  verificationStatus?: SELLER_VERIFICATION_STATUS;

  @IsOptional()
  @IsString()
  verificationDocuments?: string;

  @IsOptional()
  @IsString()
  profileImage?: string;

  @IsOptional()
  @IsString()
  bannerImage?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  commissionRate?: number;

  @IsOptional()
  @IsString()
  payoutMethod?: string;

  @IsOptional()
  @IsString()
  payoutDetails?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
