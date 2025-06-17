import { USER_TYPE } from "@/constants/user";
import { User } from "@/modules/user/entities/user.entity";

export type TransformUserInfoResult = {
  id: string;
  type: USER_TYPE;
  firstName: string;
  lastName: string;
  email: string;
  buyerId?: string;
  roles?: { id: string; name: string }[];
};

export const transformUserInfo = (user: User): TransformUserInfoResult => {
  return {
    id: user.id,
    type: user.type as USER_TYPE,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  };
};

type TransformFullUserInfoResult = Pick<
  User,
  | "id"
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "type"
  | "emailVerified"
  | "isActive"
  | "createdAt"
  | "updatedAt"
  | "roles"
>;

export const transformFullUserInfo = (
  user: User
): TransformFullUserInfoResult => {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user?.phone,
    type: user.type,
    emailVerified: user?.emailVerified,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    roles: user?.roles,
  };
};
