import { IsArray, IsOptional, IsString, IsEnum, IsBoolean, ValidateNested, IsUUID, IsNumber, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CheckoutVariantDto {
  @IsString()
  attributeId: string;

  @IsString()
  attributeValueId: string;

  @IsString()
  attributeName: string;

  @IsString()
  attributeValue: string;

  @IsNumber()
  @Type(() => Number)
  additionalPrice: number;
}

export class CheckoutItemDto {
  @IsUUID()
  id: string;

  @IsUUID()
  productId: string;

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutVariantDto)
  selectedVariants?: CheckoutVariantDto[];
}

export class CheckoutInitiateDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  cartItems: CheckoutItemDto[];

  @IsEnum(['guest', 'registered'])
  checkoutType: 'guest' | 'registered';

  @IsOptional()
  @IsString()
  guestId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true' || value === '1';
    }
    return value;
  })
  saveForLater?: boolean;
} 