export const RES_CODE_MSG = {
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
