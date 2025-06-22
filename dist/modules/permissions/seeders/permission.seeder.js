"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionSeeder = void 0;
const base_seeder_1 = require("../../../common/seeders/base.seeder");
const permission_entity_1 = require("../entities/permission.entity");
class PermissionSeeder extends base_seeder_1.BaseSeeder {
    constructor(dataSource) {
        super(dataSource);
    }
    async run() {
        const permissionRepository = this.dataSource.getRepository(permission_entity_1.Permission);
        // Clear existing permissions with CASCADE
        await this.dataSource.query('TRUNCATE TABLE "permissions" CASCADE');
        console.log("Cleared existing permissions");
        // Create permissions
        const permissions = Object.values(permission_entity_1.PERMISSION_TYPE).map(permissionType => {
            return permissionRepository.create({
                name: permissionType,
                description: this.getPermissionDescription(permissionType)
            });
        });
        // Save permissions
        await this.saveMany(permissions, permission_entity_1.Permission);
        console.log("Permissions seeded successfully");
    }
    getPermissionDescription(permission) {
        const descriptions = {
            // Product permissions
            [permission_entity_1.PERMISSION_TYPE.CREATE_PRODUCT]: "Can create new products",
            [permission_entity_1.PERMISSION_TYPE.READ_PRODUCT]: "Can view products",
            [permission_entity_1.PERMISSION_TYPE.UPDATE_PRODUCT]: "Can update existing products",
            [permission_entity_1.PERMISSION_TYPE.DELETE_PRODUCT]: "Can delete products",
            [permission_entity_1.PERMISSION_TYPE.MANAGE_PRODUCT_CATEGORIES]: "Can manage product categories",
            // Category permissions
            [permission_entity_1.PERMISSION_TYPE.CREATE_CATEGORY]: "Can create new categories",
            [permission_entity_1.PERMISSION_TYPE.READ_CATEGORY]: "Can view categories",
            [permission_entity_1.PERMISSION_TYPE.UPDATE_CATEGORY]: "Can update existing categories",
            [permission_entity_1.PERMISSION_TYPE.DELETE_CATEGORY]: "Can delete categories",
            [permission_entity_1.PERMISSION_TYPE.MANAGE_CATEGORIES]: "Can manage all categories",
            // Order permissions
            [permission_entity_1.PERMISSION_TYPE.CREATE_ORDER]: "Can create new orders",
            [permission_entity_1.PERMISSION_TYPE.READ_ORDER]: "Can view orders",
            [permission_entity_1.PERMISSION_TYPE.UPDATE_ORDER]: "Can update existing orders",
            [permission_entity_1.PERMISSION_TYPE.DELETE_ORDER]: "Can delete orders",
            [permission_entity_1.PERMISSION_TYPE.MANAGE_ORDERS]: "Can manage all orders",
            // User permissions
            [permission_entity_1.PERMISSION_TYPE.CREATE_USER]: "Can create new users",
            [permission_entity_1.PERMISSION_TYPE.READ_USER]: "Can view users",
            [permission_entity_1.PERMISSION_TYPE.UPDATE_USER]: "Can update existing users",
            [permission_entity_1.PERMISSION_TYPE.DELETE_USER]: "Can delete users",
            [permission_entity_1.PERMISSION_TYPE.MANAGE_USERS]: "Can manage all users",
            // Role permissions
            [permission_entity_1.PERMISSION_TYPE.CREATE_ROLE]: "Can create new roles",
            [permission_entity_1.PERMISSION_TYPE.READ_ROLE]: "Can view roles",
            [permission_entity_1.PERMISSION_TYPE.UPDATE_ROLE]: "Can update existing roles",
            [permission_entity_1.PERMISSION_TYPE.DELETE_ROLE]: "Can delete roles",
            [permission_entity_1.PERMISSION_TYPE.MANAGE_ROLES]: "Can manage all roles",
            // Store permissions
            [permission_entity_1.PERMISSION_TYPE.MANAGE_STORE]: "Can manage store settings",
            [permission_entity_1.PERMISSION_TYPE.MANAGE_STORE_SETTINGS]: "Can manage store settings",
            [permission_entity_1.PERMISSION_TYPE.MANAGE_STORE_INVENTORY]: "Can manage store inventory",
            // Payment permissions
            [permission_entity_1.PERMISSION_TYPE.MANAGE_PAYMENTS]: "Can manage payments",
            [permission_entity_1.PERMISSION_TYPE.PROCESS_PAYMENTS]: "Can process payments",
            [permission_entity_1.PERMISSION_TYPE.REFUND_PAYMENTS]: "Can process refunds",
            // Shipping permissions
            [permission_entity_1.PERMISSION_TYPE.MANAGE_SHIPPING]: "Can manage shipping",
            [permission_entity_1.PERMISSION_TYPE.PROCESS_SHIPPING]: "Can process shipping",
            [permission_entity_1.PERMISSION_TYPE.TRACK_SHIPPING]: "Can track shipping",
            // Review permissions
            [permission_entity_1.PERMISSION_TYPE.CREATE_REVIEW]: "Can create reviews",
            [permission_entity_1.PERMISSION_TYPE.READ_REVIEW]: "Can view reviews",
            [permission_entity_1.PERMISSION_TYPE.UPDATE_REVIEW]: "Can update reviews",
            [permission_entity_1.PERMISSION_TYPE.DELETE_REVIEW]: "Can delete reviews",
            [permission_entity_1.PERMISSION_TYPE.MANAGE_REVIEWS]: "Can manage all reviews",
            // Discount permissions
            [permission_entity_1.PERMISSION_TYPE.MANAGE_DISCOUNTS]: "Can manage discounts",
            [permission_entity_1.PERMISSION_TYPE.CREATE_DISCOUNT]: "Can create discounts",
            [permission_entity_1.PERMISSION_TYPE.UPDATE_DISCOUNT]: "Can update discounts",
            [permission_entity_1.PERMISSION_TYPE.DELETE_DISCOUNT]: "Can delete discounts"
        };
        return descriptions[permission] || "No description available";
    }
}
exports.PermissionSeeder = PermissionSeeder;
