export const RES_CODE_MSG = {
  LOGIN_SUCCESS: "Successfully login.",
  LOGOUT_SUCCESS: "Successfully logout.",
  NO_TOKEN_PROVIDED: "No token provided.",
  INVALID_TOKEN_SIGNATURE: "Invalid token signature.",
  TOKEN_EXPIRED: "Token expired.",
  INVALID_USER_OR_PASS: "Invalid username or password.",
  SESSION_EXPIRED: "Session expired. Please log in again.",
  // NOTE: HTTP Response Code
  "200": "Success",
  "204": "No Content",
  "400": "Bad Request",
  "401": "Unauthorized",
  "403": "Forbidden",
  "404": "Not Found",
  "405": "Method Not Allowed",
  "409": "Conflict",
  "500": "Internal Server Error",
  "0": "Success",
};

export type ResCode = keyof typeof RES_CODE_MSG;
const _RES_CODE = Object.keys(RES_CODE_MSG).map((key) => ({ [key]: key })) as {
  [key in ResCode]: ResCode;
}[];
export const RES_CODE = Object.assign({}, ..._RES_CODE) as {
  [key in ResCode]: ResCode;
};
