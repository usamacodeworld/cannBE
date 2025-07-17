import { NextFunction, Request, Response } from "express";
import * as userService from "./user.service";
import { getResponseAPI } from "../../common/getResponseAPI";
import { GetUsersQueryDto } from "./dto/get-users-query.dto";

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

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.validatedQuery || req.query as unknown as GetUsersQueryDto;
    const users = await userService.getUsers(query);
    res.json(getResponseAPI("0", users));
  } catch (error) {
    next(error);
  }
};
