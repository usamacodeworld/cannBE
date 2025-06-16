import { AppDataSource } from "../../../config/database";
import { User } from "../entities/user.entity";
import { CreateUserDto } from "../dto/create-user.dto";
import { UserResponseDto } from "../dto/user-response.dto";
import * as bcrypt from "bcrypt";

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
