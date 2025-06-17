// eslint-disable-next-line @typescript-eslint/no-require-imports
import jwt = require('jsonwebtoken')

import type { RegisteredUserInfo, UserInfo } from '@_types/auth'
import type { AccessTokenPayload, AccessTokenPayloadGuestUser, AccessTokenPayloadRegisteredUser } from './type'

const secretKey = process.env.JWT_SECRET // Replace with your actual secret key

const transformUserInfo = (user: UserInfo): Omit<AccessTokenPayload, 'iat' | 'exp'> => {
  if ('isGuest' in user && user.isGuest) {
    return { sub: user.id, id: user.id, isGuest: true } as AccessTokenPayloadGuestUser
  }

  // Note: we don't need this if "strict" = true in tsconfig.json
  const regUser = user as RegisteredUserInfo

  return {
    sub: regUser.id,
    id: regUser.id,
    type: user.type,
    firstName: regUser.firstName,
    lastName: regUser.lastName,
    email: regUser.email,
    roles: regUser.roles,
    ...(regUser.buyerId && { buyerId: regUser.buyerId }),
    ...(regUser.sellerId && { sellerId: regUser.sellerId }),
    ...(regUser.sellers && { sellers: regUser.sellers }),
  } as AccessTokenPayloadRegisteredUser
}

export const getAccessToken = (user: UserInfo) => {
  return jwt.sign(transformUserInfo(user), secretKey, {
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRE || '5m',
  } as jwt.SignOptions)
}

export const getRefreshToken = (user: UserInfo) => {
  return jwt.sign(transformUserInfo(user), secretKey, {
    expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRE || '1d',
  } as jwt.SignOptions)
}

// NOTE: Verify the token and return the decoded token
// NOTE: Possible errors: "invalid signature", "jwt expired"
export const verifyToken = (token: string) => {
  return jwt.verify(token, secretKey) as AccessTokenPayload
}

export const decodeToken = (token: string) => {
  return jwt.decode(token) as AccessTokenPayload
}

export const checkExpiredToken = (token: string) => {
  const decoded = decodeToken(token)

  return decoded.exp < Math.floor(Date.now() / 1000)
}
