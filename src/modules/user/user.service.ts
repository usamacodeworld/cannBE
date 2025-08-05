import { AppDataSource } from "../../config/database";
import { User } from "./user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserResponseDto } from "./dto/user-response.dto";
import { GetUsersQueryDto } from "./dto/get-users-query.dto";
import { PaginatedResponseDto } from "../../common/dto/paginated-response.dto";
import { Like } from "typeorm";
import { USER_TYPE } from "../../constants/user";

export const createUser = async (
  createUserDto: CreateUserDto
): Promise<UserResponseDto> => {
  // Get repository instance each time to ensure proper initialization
  const userRepository = AppDataSource.getRepository(User);

  // Check for existing user
  const existingUser = await userRepository.findOne({
    where: { email: createUserDto.email },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const user = userRepository.create({
    ...createUserDto,
    type: (createUserDto.role as USER_TYPE) ?? USER_TYPE.BUYER, // Default type for registration
    isActive: true, // Default to active
    emailVerified: false, // Default to not verified
  });

  await userRepository.save(user);

  // Return response DTO
  return {
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
};

export const getUserProfile = async (
  userId: string
): Promise<UserResponseDto> => {
  const userRepository = AppDataSource.getRepository(User);
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
    type: user.type as USER_TYPE,
    phone: user.phone,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const getUsers = async (
  query: GetUsersQueryDto
): Promise<PaginatedResponseDto<UserResponseDto>> => {
  const {
    page = 1,
    limit = 10,
    sort = "createdAt",
    order = "desc",
    search,
    accountType,
    emailVerified,
  } = query;
  const skip = (page - 1) * limit;

  // Build where conditions
  const whereConditions: any = {};

  if (search) {
    whereConditions.where = [
      { firstName: Like(`%${search}%`) },
      { lastName: Like(`%${search}%`) },
      { email: Like(`%${search}%`) },
      { userName: Like(`%${search}%`) },
    ];
  }

  if (accountType) {
    whereConditions.accountType = accountType;
  }

  if (emailVerified !== undefined) {
    whereConditions.emailVerified = emailVerified;
  }

  // Get total count
  const userRepository = AppDataSource.getRepository(User);
  const [users, total] = await userRepository.findAndCount({
    where: whereConditions,
    skip,
    take: limit,
    order: {
      [sort]: order.toUpperCase(),
    },
  });

  // Transform users to response DTO
  const userDtos: UserResponseDto[] = users.map((user: User) => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    type: user.type as USER_TYPE,
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
