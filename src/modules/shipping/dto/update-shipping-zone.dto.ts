import { IsString, IsOptional, IsBoolean, IsEnum, IsArray, IsNumber, IsHexColor } from 'class-validator';
import { ZONE_TYPE } from '../shipping-zone.entity';

export class UpdateShippingZoneDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ZONE_TYPE)
  @IsOptional()
  zoneType?: ZONE_TYPE;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  countries?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  states?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  cities?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  postalCodes?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  priority?: number;

  @IsHexColor()
  @IsOptional()
  color?: string;
} 