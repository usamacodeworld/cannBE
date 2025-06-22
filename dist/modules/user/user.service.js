"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = exports.getUserProfile = exports.createUser = void 0;
const database_1 = require("../../config/database");
const user_entity_1 = require("./user.entity");
const typeorm_1 = require("typeorm");
const userRepository = database_1.AppDataSource.getRepository(user_entity_1.User);
const createUser = async (createUserDto) => {
    // Check for existing user
    const existingUser = await userRepository.findOne({
        where: { email: createUserDto.email },
    });
    if (existingUser) {
        throw new Error("User already exists");
    }
    const user = userRepository.create(createUserDto);
    await userRepository.save(user);
    // Return response DTO
    return {
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
        type: user.type,
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
            { userName: (0, typeorm_1.Like)(`%${search}%`) },
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
            createdAt: "DESC",
        },
    });
    // Transform users to response DTO
    const userDtos = users.map((user) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        type: user.type,
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
            totalPages: Math.ceil(total / limit),
        },
    };
};
exports.getUsers = getUsers;
