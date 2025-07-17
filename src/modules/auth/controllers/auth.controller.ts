import { Request, Response, NextFunction } from "express";
import { LoginDto } from "../dto/login.dto";
import { AuthService } from "../services/auth.service";
import { AuthError } from "../errors/auth.error";
import { CreateUserDto } from '../../user/dto/create-user.dto';

const authService = new AuthService();

export const authController = {
  login: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const loginDto: LoginDto = req.body;
      const result = await authService.login(loginDto);
      res.status(200).json({
        message: 'Login successful',
        data: result.user,
        code: 0,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        res.status(error.statusCode).json({
          message: error.message,
          code: 1,
        });
      } else {
        next(error);
      }
    }
  },

  refreshToken: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          message: 'Refresh token is required',
          code: 1,
        });
        return;
      }

      const result = await authService.refreshToken(refreshToken);
      res.status(200).json({
        message: 'Token refreshed successfully',
        data: result,
        code: 0,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        res.status(error.statusCode).json({
          message: error.message,
          code: 1,
        });
      } else {
        next(error);
      }
    }
  },

  logout: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Clear cookies
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      res.status(200).json({
        message: 'Logout successful',
        code: 0,
      });
    } catch (error) {
      next(error);
    }
  },

  register: async (req: Request, res: Response) => {
    // This should be in a user controller, but keeping it here for now
    try {
      const createUserDto: CreateUserDto = req.body;
      // const user = await userService.create(createUserDto);
      // res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
};
