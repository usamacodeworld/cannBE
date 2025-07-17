export type AccessTokenPayloadRegisteredUser = {
  id: string;
  email: string;
};

export type AccessTokenPayloadGuestUser = {
  id: string;
  email: string;
};

export type AccessTokenPayload = AccessTokenPayloadRegisteredUser & {
  iat?: number;
  exp: number;
};
