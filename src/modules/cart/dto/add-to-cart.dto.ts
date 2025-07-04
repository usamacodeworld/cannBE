import {
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  Min,
  IsArray,
  ValidateNested,
  IsObject,
} from "class-validator";
import { Type, Transform } from "class-transformer";

export class CartVariantDto {
  @IsUUID()
  attributeId: string;

  @IsUUID()
  attributeValueId: string;

  @IsString()
  attributeName: string;

  @IsString()
  attributeValue: string;
}

export class AddToCartDto {
  @IsUUID()
  productId: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsString()
  guestId?: string; // Optional - will be auto-generated if not provided and user not logged in

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartVariantDto)
  @Transform(({ value }) => {
    if (typeof value === "string") {
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
