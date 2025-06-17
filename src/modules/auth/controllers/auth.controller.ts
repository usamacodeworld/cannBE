import { Request, Response, NextFunction } from "express";
import { LoginDto } from "../dto/login.dto";
import { getResponseAPI } from "../../../common/getResponseAPI";
import { AuthService } from "../services/auth.service";
import { AuthError } from "../errors/auth.error";
import { RES_CODE } from "../../../constants/responseCode";

const authService = new AuthService();

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const loginDto: LoginDto = req.body;
    const result = await authService.login(loginDto);
    console.log("services ==> ", result);
    res.json(getResponseAPI(RES_CODE.LOGIN_SUCCESS, result.user));
  } catch (error) {
    console.log(error);
    if (error instanceof AuthError) {
      const statusCode = error.statusCode.toString() as keyof typeof RES_CODE;
      res
        .status(error.statusCode)
        .json(getResponseAPI(RES_CODE[statusCode], { message: error.message }));
    } else {
      next(error);
    }
  }
};
