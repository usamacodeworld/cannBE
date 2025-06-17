"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = exports.getUserProfile = exports.createUser = void 0;
const database_1 = require("../../../config/database");
const role_entity_1 = require("../entities/role.entity");
const bcrypt = __importStar(require("bcrypt"));
const typeorm_1 = require("typeorm");
const userRepository = database_1.AppDataSource.getRepository(role_entity_1.User);
const createUser = async (createUserDto) => {
    // Check for existing user
    const existingUser = await userRepository.findOne({
        where: { email: createUserDto.email },
    });
    if (existingUser) {
        throw new Error("User already exists");
    }
    // Hash password and create user
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = userRepository.create({
        ...createUserDto,
        password: hashedPassword,
    });
    await userRepository.save(user);
    // Return response DTO
    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
};
exports.createUser = createUser;
const getUserProfile = async (userId) => {
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
        throw new Error("User not found");
    }
    // Return response DTO
    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
};
exports.getUserProfile = getUserProfile;
const getUsers = async (query) => {
    const { page = 1, limit = 10, search, accountType, emailVerified } = query;
    const skip = (page - 1) * limit;
    // Build where conditions
    const whereConditions = {};
    if (search) {
        whereConditions.where = [
            { firstName: (0, typeorm_1.Like)(`%${search}%`) },
            { lastName: (0, typeorm_1.Like)(`%${search}%`) },
            { email: (0, typeorm_1.Like)(`%${search}%`) },
            { userName: (0, typeorm_1.Like)(`%${search}%`) }
        ];
    }
    if (accountType) {
        whereConditions.accountType = accountType;
    }
    if (emailVerified !== undefined) {
        whereConditions.emailVerified = emailVerified;
    }
    // Get total count
    const [users, total] = await userRepository.findAndCount({
        where: whereConditions,
        skip,
        take: limit,
        order: {
            createdAt: 'DESC'
        }
    });
    // Transform users to response DTO
    const userDtos = users.map(user => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    }));
    return {
        data: userDtos,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
};
exports.getUsers = getUsers;
