import 'express-session'

export type SessionUser = {
  accessToken: string
  // expiresIn: number
  // refreshExpiresIn: number
  refreshToken: string
  // tokenType: string
  // sessionState: string
  // scope: string
  createdAt: Date
}

declare module 'express-session' {
  interface SessionData {
    user: SessionUser
  }
}

export {}
