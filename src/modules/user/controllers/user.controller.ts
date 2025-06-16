import { NextFunction, Request, Response } from "express";
import * as userService from "../services/user.service";
import { getResponseAPI } from "../../../common/getResponseAPI";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const newUser = await userService.createUser(req.body);
    res.json(getResponseAPI("0", newUser));
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const userProfile = await userService.getUserProfile(userId);
    res.json(getResponseAPI("0", { user: userProfile }));
  } catch (error) {
    next(error);
  }
};
