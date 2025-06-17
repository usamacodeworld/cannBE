import { AppDataSource } from "../../../config/database";
import { Role } from "../entities/role.entity";
import { CreateRoleDto } from "../dto/create-role.dto";
import { UpdateRoleDto } from "../dto/update-role.dto";
import { PERMISSION_TYPE } from "../../permissions/entities/permission.entity";
import { Permission } from "../../permissions/entities/permission.entity";
import { In } from "typeorm";

const roleRepository = AppDataSource.getRepository(Role);
const permissionRepository = AppDataSource.getRepository(Permission);

export const getRoles = async (): Promise<Role[]> => {
  return roleRepository.find({
    relations: ["permissions"]
  });
};

export const getRoleById = async (id: string): Promise<Role | null> => {
  return roleRepository.findOne({
    where: { id },
    relations: ["permissions"]
  });
};

export const createRole = async (
  createRoleDto: CreateRoleDto
): Promise<Role> => {
  const existingRole = await roleRepository.findOne({
    where: { name: createRoleDto.name }
  });

  if (existingRole) {
    throw new Error("Role already exists");
  }

  const role = roleRepository.create(createRoleDto);
  return roleRepository.save(role);
};

export const updateRole = async (
  id: string,
  updateRoleDto: UpdateRoleDto
): Promise<Role | null> => {
  const role = await roleRepository.findOne({
    where: { id }
  });

  if (!role) {
    return null;
  }

  Object.assign(role, updateRoleDto);
  return roleRepository.save(role);
};

export const deleteRole = async (id: string): Promise<boolean> => {
  const role = await roleRepository.findOne({
    where: { id },
    relations: ["permissions"]
  });

  if (!role) {
    return false;
  }

  await roleRepository.remove(role);
  return true;
};

export const assignPermissions = async (
  id: string,
  permissionNames: PERMISSION_TYPE[]
): Promise<Role | null> => {
  const role = await roleRepository.findOne({
    where: { id },
    relations: ["permissions"]
  });

  if (!role) {
    return null;
  }

  const permissions = await permissionRepository.findBy({
    name: In(permissionNames)
  });

  role.permissions = [...role.permissions, ...permissions];
  return roleRepository.save(role);
};

export const removePermissions = async (
  id: string,
  permissionNames: PERMISSION_TYPE[]
): Promise<Role | null> => {
  const role = await roleRepository.findOne({
    where: { id },
    relations: ["permissions"]
  });

  if (!role) {
    return null;
  }

  role.permissions = role.permissions.filter(
    permission => !permissionNames.includes(permission.name)
  );

  return roleRepository.save(role);
}; 