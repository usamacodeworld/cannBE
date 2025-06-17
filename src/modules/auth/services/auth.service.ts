import { AppDataSource } from "../../../config/database";
import { User } from "../../user/entities/user.entity";
import { LoginDto } from "../dto/login.dto";
import { UserResponseDto } from "../../user/dto/user-response.dto";
import * as bcrypt from "bcrypt";
import { getAccessToken } from "../../../libs/jwt";
import { AuthError } from "../errors/auth.error";

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  async login(loginDto: LoginDto): Promise<{ user: UserResponseDto; token: string }> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new AuthError("Invalid credentials", 401);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AuthError("Invalid credentials", 401);
    }

    // Generate JWT token
    const token = getAccessToken({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles || []
    });

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

    return { user: userResponse, token };
  }
} 