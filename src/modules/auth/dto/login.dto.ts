import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';
import { USER_TYPE } from '../../../constants/user';

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsEnum(USER_TYPE, { message: 'User type must be admin, seller, or buyer' })
  userType: USER_TYPE;
} 