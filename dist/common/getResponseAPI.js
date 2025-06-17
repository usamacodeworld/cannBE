"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResponseAPI = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const responseCode_1 = require("../constants/responseCode");
const cuid_1 = require("../libs/cuid");
const getResponseAPI = (code, data) => {
    const hasError = data?.errors;
    const hasAddonMsg = data?.additionalMsg;
    const defaultResponse = {
        message: responseCode_1.RES_CODE_MSG[code],
        requestId: (0, cuid_1.cuid)(),
        ...(hasError && { errors: data.errors }),
        ...(hasAddonMsg && { additionalMessage: data.additionalMsg }),
        ...(!hasError && !hasAddonMsg && { data }),
    };
    const codeNumb = Number(code);
    const isNaN = Number.isNaN(codeNumb);
    switch (code) {
        case responseCode_1.RES_CODE.LOGIN_SUCCESS:
        case responseCode_1.RES_CODE.LOGOUT_SUCCESS:
            return { ...defaultResponse, code: 0 };
        case responseCode_1.RES_CODE[401]:
        case responseCode_1.RES_CODE.INVALID_TOKEN_SIGNATURE:
        case responseCode_1.RES_CODE.INVALID_USER_OR_PASS:
        case responseCode_1.RES_CODE.NO_TOKEN_PROVIDED:
        case responseCode_1.RES_CODE.TOKEN_EXPIRED:
            return { code: 401, ...defaultResponse };
        case responseCode_1.RES_CODE[400]:
        default:
            return {
                code: isNaN ? code : codeNumb || 0,
                message: responseCode_1.RES_CODE[0],
                ...defaultResponse,
            };
    }
};
exports.getResponseAPI = getResponseAPI;
