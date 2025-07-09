import { USER_TYPE } from "../../../constants/user";
import { BaseDto } from "../../../common/dto/base.dto";
import { Role } from "../../role/entities/role.entity";

export class UserResponseDto implements BaseDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  type: USER_TYPE;
  emailVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
  roles?: Role[];
}
