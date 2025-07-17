import { USER_TYPE } from "../constants/user";
import { User } from "../modules/user/user.entity";
import { Role } from "../modules/role/entities/role.entity";

export type GrantType = "password" | "refreshToken";
export type AuthType = "bearer" | "cookie";
export type RegisteredUserInfo = {
  id: string;
  type: USER_TYPE;
  firstName: string;
  lastName: string;
  email: string;
  roles?: Role[];
};

export type GuestUserInfo = {
  id: string;
  type: null;
  isGuest: true;
};

export type UserInfo = {
  id: string;
  type?: USER_TYPE;
  firstName?: string;
  lastName?: string;
  email?: string;
  roles?: Role[];
  isGuest?: boolean;
};

export type LoginRequest = {
  username?: string;
  password?: string;
  grantType?: GrantType;
  refreshToken?: string;
  authType?: AuthType;
  userType?: `${USER_TYPE}`;
};

export type SignInResponse = Promise<UserInfo>;
