import { IsOptional, IsString, IsBoolean, IsEnum, IsNumber } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { ZONE_TYPE } from '../shipping-zone.entity';

export class GetShippingZonesQueryDto extends PaginationQueryDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  sort?: string = 'priority';

  @IsString()
  @IsOptional()
  order?: string = 'asc';

  @IsEnum(ZONE_TYPE)
  @IsOptional()
  zoneType?: ZONE_TYPE;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;
} 