import { IsEmail, IsString, IsOptional, MinLength, IsBoolean, Matches } from 'class-validator';

export class CreateCategoryDto {
    @IsString({ message: 'Category name must be a string' })
    @MinLength(2)
    name: string;
} 