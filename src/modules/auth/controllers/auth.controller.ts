import { Request, Response } from "express";
import { AppDataSource } from "../../../config/database";
import { User } from "../../user/entities/user.entity";
import { LoginDto } from "../dto/login.dto";
import { UserResponseDto } from "../../user/dto/user-response.dto";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { getResponseAPI } from "../../../common/getResponseAPI";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const { email, password }: LoginDto = req.body;
    // Find user by email
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      res.json(getResponseAPI("401", { message: "Invalid credentials" }));
      return;
    }
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      res.json(getResponseAPI("401", { message: "Invalid credentials" }));
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1d" }
    );

    // Return user data without password
    const userResponse: UserResponseDto = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.json(getResponseAPI("0", { user: userResponse, token }));
  } catch (error) {
    console.error("Login error:", error);
    res.json(getResponseAPI("500", { message: "IInternal server error" }));
  }
};
