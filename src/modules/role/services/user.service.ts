import { AppDataSource } from "../../../config/database";
import { User } from "../../user/user.entity";
import { CreateUserDto } from "../dto/create-user.dto";
import { UserResponseDto } from "../dto/user-response.dto";
import { GetUsersQueryDto } from "../dto/get-users-query.dto";
import { PaginatedResponseDto } from "../../../common/dto/paginated-response.dto";
import * as bcrypt from "bcrypt";
import { Like } from "typeorm";

const userRepository = AppDataSource.getRepository(User);

export const createUser = async (
  createUserDto: CreateUserDto
): Promise<UserResponseDto> => {
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

export const getUserProfile = async (
  userId: string
): Promise<UserResponseDto> => {
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

export const getUsers = async (
  query: GetUsersQueryDto
): Promise<PaginatedResponseDto<UserResponseDto>> => {
  const { page = 1, limit = 10, search, accountType, emailVerified } = query;
  const skip = (page - 1) * limit;

  // Build where conditions
  const whereConditions: any = {};
  
  if (search) {
    whereConditions.where = [
      { firstName: Like(`%${search}%`) },
      { lastName: Like(`%${search}%`) },
      { email: Like(`%${search}%`) },
      { userName: Like(`%${search}%`) }
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
  const userDtos: UserResponseDto[] = users.map(user => ({
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
