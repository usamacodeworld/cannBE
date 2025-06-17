"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePermission = exports.updatePermission = exports.createPermission = exports.getPermissionByName = exports.getPermissions = void 0;
const database_1 = require("../../../config/database");
const permission_entity_1 = require("../entities/permission.entity");
const permissionRepository = database_1.AppDataSource.getRepository(permission_entity_1.Permission);
const getPermissions = async () => {
    return permissionRepository.find({
        relations: ["roles"]
    });
};
exports.getPermissions = getPermissions;
const getPermissionByName = async (name) => {
    return permissionRepository.findOne({
        where: { name },
        relations: ["roles"]
    });
};
exports.getPermissionByName = getPermissionByName;
const createPermission = async (createPermissionDto) => {
    const existingPermission = await permissionRepository.findOne({
        where: { name: createPermissionDto.name }
    });
    if (existingPermission) {
        throw new Error("Permission already exists");
    }
    const permission = permissionRepository.create(createPermissionDto);
    return permissionRepository.save(permission);
};
exports.createPermission = createPermission;
const updatePermission = async (name, updatePermissionDto) => {
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
exports.updatePermission = updatePermission;
const deletePermission = async (name) => {
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
exports.deletePermission = deletePermission;
