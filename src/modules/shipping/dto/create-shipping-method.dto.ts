import { IsString, IsOptional, IsBoolean, IsEnum, IsNumber, IsUUID, IsHexColor } from 'class-validator';
import { METHOD_TYPE, CARRIER_TYPE } from '../shipping-method.entity';

export class CreateShippingMethodDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(METHOD_TYPE)
  @IsOptional()
  methodType?: METHOD_TYPE;

  @IsEnum(CARRIER_TYPE)
  @IsOptional()
  carrierType?: CARRIER_TYPE;

  @IsUUID()
  @IsOptional()
  zoneId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  priority?: number;

  @IsNumber()
  @IsOptional()
  estimatedDays?: number;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsHexColor()
  @IsOptional()
  color?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsBoolean()
  @IsOptional()
  requiresSignature?: boolean;

  @IsBoolean()
  @IsOptional()
  isInsured?: boolean;

  @IsNumber()
  @IsOptional()
  insuranceAmount?: number;
} 