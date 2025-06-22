"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const database_1 = require("../../../config/database");
const user_entity_1 = require("../../user/user.entity");
const jwt_1 = require("../../../libs/jwt");
const auth_error_1 = require("../errors/auth.error");
class AuthService {
    constructor() {
        this.userRepository = database_1.AppDataSource.getRepository(user_entity_1.User);
    }
    async login(loginDto) {
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
            throw new auth_error_1.AuthError("Invalid credentials", 401);
        }
        // Verify password using the User entity's comparePassword method
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            throw new auth_error_1.AuthError("Invalid credentials", 401);
        }
        // Return user data without password and roles
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
                accessToken: (0, jwt_1.getAccessToken)(tokenInfo),
                refreshToken: (0, jwt_1.getRefreshToken)(tokenInfo),
            },
        };
    }
}
exports.AuthService = AuthService;
