import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetAttributesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;
} 