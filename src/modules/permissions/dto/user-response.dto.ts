import { BaseDto } from '../../../common/dto/base.dto';

export class UserResponseDto implements BaseDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  emailVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
} 