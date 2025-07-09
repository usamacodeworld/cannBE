import { AppDataSource } from "../../../config/database";
import { User } from "../../user/user.entity";
import { LoginDto } from "../dto/login.dto";
import { UserResponseDto } from "../../user/dto/user-response.dto";
import { getAccessToken, getRefreshToken } from "../../../libs/jwt";
import { AuthError } from "../errors/auth.error";
import { UserInfo } from "@/types/auth";
import { USER_TYPE } from "../../../constants/user";
import { verifyToken } from "../../../libs/jwt";

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  async login(loginDto: LoginDto): Promise<{
    user: Omit<UserResponseDto, "roles"> & {
      accessToken: string;
      refreshToken: string;
    };
  }> {
    const { email, password, userType } = loginDto;

    // Find user by email with roles and permissions
    const user = await this.userRepository.findOne({
      where: { email },
      relations: {
        roles: {
          permissions: true,
        },
      },
    });
    console.log("User ==> ", user);
    if (!user) {
      throw new AuthError("Invalid credentials", 401);
    }

    // Verify password using the User entity's comparePassword method
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw new AuthError("Invalid credentials", 401);
    }

    // Validate userType (now required)
    if (user.type !== userType) {
      throw new AuthError(
        `Access denied. This account is for ${user.type} users only.`,
        403
      );
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
      roles: user.roles?.map((role) => ({
        id: role.id,
        name: role.name,
        permissions: role.permissions.map((p) => p.name),
      })),
    };

    return {
      user: {
        ...userResponse,
        accessToken: getAccessToken(tokenInfo as UserInfo),
        refreshToken: getRefreshToken(tokenInfo as UserInfo),
      },
    };
  }

  async refreshToken(
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Verify the refresh token
      const decoded = verifyToken(refreshToken);
      if (!decoded) {
        throw new AuthError("Invalid refresh token", 401);
      }

      // Find user by ID and check if the refresh token matches
      const user = await this.userRepository.findOne({
        where: { id: decoded.id },
        relations: ["roles", "roles.permissions"],
      });

      if (!user) {
        throw new AuthError(
          "Invalid refresh token or token has been revoked",
          401
        );
      }

      // Create new tokens
      const tokenInfo = {
        id: user.id,
        email: user.email,
        roles: user.roles?.map((role) => ({
          id: role.id,
          name: role.name,
          permissions: role.permissions.map((p) => p.name),
        })),
      };

      const newAccessToken = getAccessToken(tokenInfo as UserInfo);
      const newRefreshToken = getRefreshToken(tokenInfo as UserInfo);

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new AuthError("Session expired. Please log in again.", 401);
    }
  }
}
