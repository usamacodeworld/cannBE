import { IsOptional, IsNumber, IsString, Min, IsArray, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { CartVariantDto } from './add-to-cart.dto';

export class UpdateCartDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartVariantDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return value;
  })
  variants?: CartVariantDto[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  price?: number;
} 