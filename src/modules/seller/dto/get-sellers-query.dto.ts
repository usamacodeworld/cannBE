import { IsOptional, IsString, IsEnum, IsBoolean } from "class-validator";
import { Transform } from "class-transformer";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";
import {
  SELLER_STATUS,
  SELLER_VERIFICATION_STATUS,
} from "../entities/seller.entity";

export class GetSellersQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(SELLER_STATUS)
  status?: SELLER_STATUS;

  @IsOptional()
  @IsEnum(SELLER_VERIFICATION_STATUS)
  verificationStatus?: SELLER_VERIFICATION_STATUS;

  @IsOptional()
  @IsString()
  businessCity?: string;

  @IsOptional()
  @IsString()
  businessState?: string;

  @IsOptional()
  @IsString()
  businessCountry?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value === "true" || value === "1";
    }
    return value;
  })
  includeUser?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value === "true" || value === "1";
    }
    return value;
  })
  includeProducts?: boolean;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsString()
  order?: "asc" | "desc";
}
