import { IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ADDRESS_TYPE, ADDRESS_STATUS } from '../address.entity';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class GetAddressesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(ADDRESS_TYPE)
  type?: ADDRESS_TYPE;

  @IsOptional()
  @IsEnum(ADDRESS_STATUS)
  status?: ADDRESS_STATUS;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
} 