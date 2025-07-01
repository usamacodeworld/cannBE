import { IsOptional, IsString } from 'class-validator';

export class GetCartQueryDto {
  @IsOptional()
  @IsString()
  guestId?: string;

  @IsOptional()
  @IsString()
  userId?: string;
} 