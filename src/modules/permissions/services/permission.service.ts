import { AppDataSource } from "../../../config/database";
import { Permission, PERMISSION_TYPE } from "../entities/permission.entity";
import { CreatePermissionDto } from "../dto/create-permission.dto";
import { UpdatePermissionDto } from "../dto/update-permission.dto";

const permissionRepository = AppDataSource.getRepository(Permission);

export const getPermissions = async (): Promise<Permission[]> => {
  return permissionRepository.find({
    relations: ["roles"]
  });
};

export const getPermissionByName = async (
  name: PERMISSION_TYPE
): Promise<Permission | null> => {
  return permissionRepository.findOne({
    where: { name },
    relations: ["roles"]
  });
};

export const createPermission = async (
  createPermissionDto: CreatePermissionDto
): Promise<Permission> => {
  const existingPermission = await permissionRepository.findOne({
    where: { name: createPermissionDto.name }
  });

  if (existingPermission) {
    throw new Error("Permission already exists");
  }

  const permission = permissionRepository.create(createPermissionDto);
  return permissionRepository.save(permission);
};

export const updatePermission = async (
  name: PERMISSION_TYPE,
  updatePermissionDto: UpdatePermissionDto
): Promise<Permission | null> => {
  const permission = await permissionRepository.findOne({
    where: { name }
  });

  if (!permission) {
    return null;
  }

  // Don't allow updating the permission name
  const { name: _, ...updateData } = updatePermissionDto;
  
  Object.assign(permission, updateData);
  return permissionRepository.save(permission);
};

export const deletePermission = async (
  name: PERMISSION_TYPE
): Promise<boolean> => {
  const permission = await permissionRepository.findOne({
    where: { name },
    relations: ["roles"]
  });

  if (!permission) {
    return false;
  }

  // Check if permission is used by any roles
  if (permission.roles && permission.roles.length > 0) {
    throw new Error("Cannot delete permission that is assigned to roles");
  }

  await permissionRepository.remove(permission);
  return true;
}; 