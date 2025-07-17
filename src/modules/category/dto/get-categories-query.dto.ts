import {
  IsOptional,
  IsString,
  IsBoolean,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";

class CategoryFilters {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isPopular?: boolean;
}

export class GetCategoriesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsString()
  order?: "asc" | "desc";

  @IsOptional()
  @ValidateNested()
  @Type(() => CategoryFilters)
  filters?: CategoryFilters;
}
