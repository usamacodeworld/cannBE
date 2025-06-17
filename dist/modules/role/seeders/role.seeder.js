"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleSeeder = void 0;
const base_seeder_1 = require("../../../common/seeders/base.seeder");
const role_entity_1 = require("../entities/role.entity");
const permission_entity_1 = require("../../permissions/entities/permission.entity");
class RoleSeeder extends base_seeder_1.BaseSeeder {
    constructor(dataSource) {
        super(dataSource);
    }
    async run() {
        const roleRepository = this.dataSource.getRepository(role_entity_1.Role);
        const permissionRepository = this.dataSource.getRepository(permission_entity_1.Permission);
        // Clear existing roles with CASCADE
        await this.dataSource.query('TRUNCATE TABLE "roles" CASCADE');
        console.log("Cleared existing roles");
        // Get all permissions
        const permissions = await permissionRepository.find();
        // Create roles with their permissions
        const roles = [
            {
                name: "Super Admin",
                description: "Has full access to all features",
                permissions: permissions
            },
            {
                name: "Store Admin",
                description: "Can manage store operations",
                permissions: permissions.filter(p => p.name !== permission_entity_1.PERMISSION_TYPE.MANAGE_ROLES &&
                    p.name !== permission_entity_1.PERMISSION_TYPE.CREATE_ROLE &&
                    p.name !== permission_entity_1.PERMISSION_TYPE.UPDATE_ROLE &&
                    p.name !== permission_entity_1.PERMISSION_TYPE.DELETE_ROLE)
            },
            {
                name: "Store Manager",
                description: "Can manage store inventory and orders",
                permissions: permissions.filter(p => p.name === permission_entity_1.PERMISSION_TYPE.MANAGE_STORE_INVENTORY ||
                    p.name === permission_entity_1.PERMISSION_TYPE.MANAGE_ORDERS ||
                    p.name === permission_entity_1.PERMISSION_TYPE.PROCESS_SHIPPING ||
                    p.name === permission_entity_1.PERMISSION_TYPE.TRACK_SHIPPING ||
                    p.name === permission_entity_1.PERMISSION_TYPE.MANAGE_REVIEWS ||
                    p.name === permission_entity_1.PERMISSION_TYPE.MANAGE_DISCOUNTS)
            },
            {
                name: "Seller",
                description: "Can manage their own products and orders",
                permissions: permissions.filter(p => p.name === permission_entity_1.PERMISSION_TYPE.CREATE_PRODUCT ||
                    p.name === permission_entity_1.PERMISSION_TYPE.READ_PRODUCT ||
                    p.name === permission_entity_1.PERMISSION_TYPE.UPDATE_PRODUCT ||
                    p.name === permission_entity_1.PERMISSION_TYPE.DELETE_PRODUCT ||
                    p.name === permission_entity_1.PERMISSION_TYPE.READ_ORDER ||
                    p.name === permission_entity_1.PERMISSION_TYPE.UPDATE_ORDER ||
                    p.name === permission_entity_1.PERMISSION_TYPE.PROCESS_SHIPPING ||
                    p.name === permission_entity_1.PERMISSION_TYPE.TRACK_SHIPPING ||
                    p.name === permission_entity_1.PERMISSION_TYPE.READ_REVIEW ||
                    p.name === permission_entity_1.PERMISSION_TYPE.MANAGE_REVIEWS)
            },
            {
                name: "Customer",
                description: "Can place orders and manage their account",
                permissions: permissions.filter(p => p.name === permission_entity_1.PERMISSION_TYPE.CREATE_ORDER ||
                    p.name === permission_entity_1.PERMISSION_TYPE.READ_ORDER ||
                    p.name === permission_entity_1.PERMISSION_TYPE.CREATE_REVIEW ||
                    p.name === permission_entity_1.PERMISSION_TYPE.READ_REVIEW ||
                    p.name === permission_entity_1.PERMISSION_TYPE.TRACK_SHIPPING)
            }
        ];
        // Create and save roles
        for (const roleData of roles) {
            const role = roleRepository.create({
                name: roleData.name,
                description: roleData.description,
                permissions: roleData.permissions
            });
            await roleRepository.save(role);
        }
        console.log("Roles seeded successfully");
    }
}
exports.RoleSeeder = RoleSeeder;
