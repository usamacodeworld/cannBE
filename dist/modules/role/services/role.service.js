"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removePermissions = exports.assignPermissions = exports.deleteRole = exports.updateRole = exports.createRole = exports.getRoleById = exports.getRoles = void 0;
const database_1 = require("../../../config/database");
const role_entity_1 = require("../entities/role.entity");
const permission_entity_1 = require("../../permissions/entities/permission.entity");
const typeorm_1 = require("typeorm");
const roleRepository = database_1.AppDataSource.getRepository(role_entity_1.Role);
const permissionRepository = database_1.AppDataSource.getRepository(permission_entity_1.Permission);
const getRoles = async () => {
    return roleRepository.find({
        relations: ["permissions"]
    });
};
exports.getRoles = getRoles;
const getRoleById = async (id) => {
    return roleRepository.findOne({
        where: { id },
        relations: ["permissions"]
    });
};
exports.getRoleById = getRoleById;
const createRole = async (createRoleDto) => {
    const existingRole = await roleRepository.findOne({
        where: { name: createRoleDto.name }
    });
    if (existingRole) {
        throw new Error("Role already exists");
    }
    const role = roleRepository.create(createRoleDto);
    return roleRepository.save(role);
};
exports.createRole = createRole;
const updateRole = async (id, updateRoleDto) => {
    const role = await roleRepository.findOne({
        where: { id }
    });
    if (!role) {
        return null;
    }
    Object.assign(role, updateRoleDto);
    return roleRepository.save(role);
};
exports.updateRole = updateRole;
const deleteRole = async (id) => {
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
exports.deleteRole = deleteRole;
const assignPermissions = async (id, permissionNames) => {
    const role = await roleRepository.findOne({
        where: { id },
        relations: ["permissions"]
    });
    if (!role) {
        return null;
    }
    const permissions = await permissionRepository.findBy({
        name: (0, typeorm_1.In)(permissionNames)
    });
    role.permissions = [...role.permissions, ...permissions];
    return roleRepository.save(role);
};
exports.assignPermissions = assignPermissions;
const removePermissions = async (id, permissionNames) => {
    const role = await roleRepository.findOne({
        where: { id },
        relations: ["permissions"]
    });
    if (!role) {
        return null;
    }
    role.permissions = role.permissions.filter(permission => !permissionNames.includes(permission.name));
    return roleRepository.save(role);
};
exports.removePermissions = removePermissions;
