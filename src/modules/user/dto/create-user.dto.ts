import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  IsBoolean,
  Matches,
} from "class-validator";

export class CreateUserDto {
  @IsOptional()
  @IsString({ message: "Username must be a string" })
  @MinLength(2)
  userName: string;

  @IsString({ message: "First name must be a string" })
  @MinLength(2)
  firstName: string;

  @IsString({ message: "Last name must be a string" })
  @MinLength(2)
  lastName: string;

  @IsEmail({}, { message: "Please provide a valid email address" })
  email: string;

  @IsString({ message: "Password must be a string" })
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  password: string;

  @IsOptional()
  @IsString({ message: "Phone number must be a string" })
  // @Matches(/^\+?[1-9]\d{1,14}$/, {
  //   message: "Please provide a valid phone number",
  // })
  phone?: string;

  @IsOptional()
  @IsBoolean({ message: "is Active must be a boolean" })
  isActive?: boolean;

  @IsOptional()
  @IsBoolean({ message: "Email verification status must be a boolean" })
  emailVerified?: boolean;

  @IsOptional()
  @IsString({ message: "role must be a string" })
  role?: string;

  @IsOptional()
  @IsString({ message: "GuestId to register Guest account as User" })
  guestId?: string;

  @IsOptional()
  @IsString({ message: "type must be a string" })
  type?: string;
}
