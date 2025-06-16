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
    case RES_CODE[401]:
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
