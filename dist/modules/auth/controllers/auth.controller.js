"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const getResponseAPI_1 = require("../../../common/getResponseAPI");
const auth_service_1 = require("../services/auth.service");
const auth_error_1 = require("../errors/auth.error");
const responseCode_1 = require("../../../constants/responseCode");
const authService = new auth_service_1.AuthService();
const login = async (req, res, next) => {
    try {
        const loginDto = req.body;
        const result = await authService.login(loginDto);
        console.log("services ==> ", result);
        res.json((0, getResponseAPI_1.getResponseAPI)(responseCode_1.RES_CODE.LOGIN_SUCCESS, result.user));
    }
    catch (error) {
        console.log(error);
        if (error instanceof auth_error_1.AuthError) {
            const statusCode = error.statusCode.toString();
            res
                .status(error.statusCode)
                .json((0, getResponseAPI_1.getResponseAPI)(responseCode_1.RES_CODE[statusCode], { message: error.message }));
        }
        else {
            next(error);
        }
    }
};
exports.login = login;
