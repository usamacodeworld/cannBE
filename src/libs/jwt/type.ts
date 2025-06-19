import { USER_TYPE } from "@/constants/user"
import { TransformUserInfoResult } from "@/utils/transformUserInfo"

export type AccessTokenPayloadRegisteredUser = {
  id: string
  email: string
}

export type AccessTokenPayloadGuestUser = {
  id: string
  email: string
}

export type AccessTokenPayload = AccessTokenPayloadRegisteredUser & {
  iat?: number
  exp: number
}
