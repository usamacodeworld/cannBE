/* eslint-disable @typescript-eslint/no-explicit-any */
import { RES_CODE_MSG, ResCode, RES_CODE } from "../constants/responseCode";
import { cuid } from "../libs/cuid";

type getResponseAPIData =
  | {
      errors?: any;
      additionalMsg?: string;
    }
  | { [key in string]: any };

export const getResponseAPI = (code: ResCode, data?: getResponseAPIData) => {
  const hasError = data?.errors;
  const hasAddonMsg = data?.additionalMsg;
  const defaultResponse = {
    message: RES_CODE_MSG[code],
    requestId: cuid(),
    ...(hasError && { errors: data.errors }),
    ...(hasAddonMsg && { additionalMessage: data.additionalMsg }),
    ...(!hasError && !hasAddonMsg && { data }),
  };
  const codeNumb = Number(code);
  const isNaN = Number.isNaN(codeNumb);

  switch (code) {
    case RES_CODE.LOGIN_SUCCESS:
    case RES_CODE.LOGOUT_SUCCESS:
      return { ...defaultResponse, code: 0 };
    case RES_CODE[401]:
    case RES_CODE.INVALID_TOKEN_SIGNATURE:
    case RES_CODE.INVALID_USER_OR_PASS:
    case RES_CODE.NO_TOKEN_PROVIDED:
    case RES_CODE.TOKEN_EXPIRED:
      return { code: 401, ...defaultResponse };
    case RES_CODE[400]:
    default:
      return {
        code: isNaN ? code : codeNumb || 0,
        message: RES_CODE[0],
        ...defaultResponse,
      };
  }
};
