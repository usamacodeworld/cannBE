import { AppDataSource } from "../../../config/database";
import { User } from "../../user/user.entity";
import { LoginDto } from "../dto/login.dto";
import { UserResponseDto } from "../../user/dto/user-response.dto";
import { getAccessToken, getRefreshToken } from "../../../libs/jwt";
import { AuthError } from "../errors/auth.error";
import { UserInfo } from "@/types/auth";
import { USER_TYPE } from "@/constants/user";

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  async login(loginDto: LoginDto): Promise<{
    user: Omit<UserResponseDto, 'roles'> & { accessToken: string; refreshToken: string };
  }> {
    const { email, password } = loginDto;

    // Find user by email with roles and permissions
    const user = await this.userRepository.findOne({
      where: { email },
      relations: {
        roles: {
          permissions: true
        }
      }
    });
    if (!user) {
      throw new AuthError("Invalid credentials", 401);
    }

    // Verify password using the User entity's comparePassword method
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw new AuthError("Invalid credentials", 401);
    }

    // Return user data without password and roles
    const userResponse = {
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

    // Create token info with roles (for authorization)
    const tokenInfo = {
      ...userResponse,
      roles: user.roles?.map(role => ({
        id: role.id,
        name: role.name,
        permissions: role.permissions.map(p => p.name)
      }))
    };

    return {
      user: {
        ...userResponse,
        accessToken: getAccessToken(tokenInfo as UserInfo),
        refreshToken: getRefreshToken(tokenInfo as UserInfo),
      },
    };
  }
}
