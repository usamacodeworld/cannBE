import { USER_TYPE } from "@/constants/user"
import { TransformUserInfoResult } from "@/utils/transformUserInfo"


export type AccessTokenPayloadRegisteredUser = {
  id: string
  type?: `${USER_TYPE}`
  username?: string
  firstName?: string
  lastName?: string
  email?: string

  // Add more properties here
  isGuest?: boolean
} 
& Pick<TransformUserInfoResult, 'roles' >

// export type AccessTokenPayloadGuestUser = {
//   sub: string
//   id: string

//   // Add more properties here
//   isGuest: true
// }

export type AccessTokenPayload = AccessTokenPayloadRegisteredUser /*| AccessTokenPayloadGuestUser*/ & {
  iat: number
  exp: number
}

export type AccessTokenPayloadGuestUser = AccessTokenPayloadRegisteredUser /*| AccessTokenPayloadGuestUser*/ & {
  iat: number
  exp: number
  isGuest: true
}
