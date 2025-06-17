import { AppDataSource } from "../../../config/database";
import { User } from "../../user/entities/user.entity";
import { LoginDto } from "../dto/login.dto";
import { UserResponseDto } from "../../user/dto/user-response.dto";
import { getAccessToken, getRefreshToken } from "../../../libs/jwt";
import { AuthError } from "../errors/auth.error";
import { UserInfo } from "@/types/auth";
import { USER_TYPE } from "@/constants/user";

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  async login(loginDto: LoginDto): Promise<{
    user: UserResponseDto & { accessToken: string; refreshToken: string };
  }> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new AuthError("Invalid credentials", 401);
    }

    // Verify password using the User entity's comparePassword method
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw new AuthError("Invalid credentials", 401);
    }

    // Generate JWT token
    // const accessToken = getAccessToken({
    //   id: user.id,
    //   email: user.email,
    //   firstName: user.firstName,
    //   lastName: user.lastName,
    //   roles: user.roles || [],
    // });

    // const refreshToken = getRefreshToken({
    //   id: user.id,
    //   email: user.email,
    //   firstName: user.firstName,
    //   lastName: user.lastName,
    //   roles: user.roles || [],
    // });

    // Return user data without password
    const userResponse: UserResponseDto = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      type: user.type as USER_TYPE,
      phone: user.phone,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    console.log(userResponse);
    return {
      user: {
        ...userResponse,
        accessToken: getAccessToken(userResponse as UserInfo),
        refreshToken: getRefreshToken(userResponse as UserInfo),
      },
    };
  }
}
