
import { USER_TYPE } from '@/constants/user'
import { User } from '@/modules/user/entities/user.entity'

export type GrantType = 'password' | 'refreshToken'
export type AuthType = 'bearer' | 'cookie'
export type RegisteredUserInfo = Pick<User, 'id' | 'type' | 'firstName' | 'lastName' | 'email'>

export type GuestUserInfo = {
  id: string
  type: null
  isGuest: true
}
export type UserInfo = RegisteredUserInfo | GuestUserInfo

export type LoginRequest = {
  username?: string
  password?: string
  grantType?: GrantType
  refreshToken?: string
  authType?: AuthType
  userType?: `${USER_TYPE}`
}
export type SignInResponse = Promise<UserInfo>
