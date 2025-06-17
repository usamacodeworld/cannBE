"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const database_1 = require("../../../config/database");
const user_entity_1 = require("../../user/entities/user.entity");
const jwt_1 = require("../../../libs/jwt");
const auth_error_1 = require("../errors/auth.error");
class AuthService {
    constructor() {
        this.userRepository = database_1.AppDataSource.getRepository(user_entity_1.User);
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        // Find user by email
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new auth_error_1.AuthError("Invalid credentials", 401);
        }
        // Verify password using the User entity's comparePassword method
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            throw new auth_error_1.AuthError("Invalid credentials", 401);
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
        const userResponse = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            type: user.type,
            phone: user.phone,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
        console.log(userResponse);
        return {
            user: {
                ...userResponse,
                accessToken: (0, jwt_1.getAccessToken)(userResponse),
                refreshToken: (0, jwt_1.getRefreshToken)(userResponse),
            },
        };
    }
}
exports.AuthService = AuthService;
