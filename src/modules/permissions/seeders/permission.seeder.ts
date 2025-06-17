import { DataSource } from "typeorm";
import { BaseSeeder } from "../../../common/seeders/base.seeder";
import { Permission, PERMISSION_TYPE } from "../entities/permission.entity";

export class PermissionSeeder extends BaseSeeder {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const permissionRepository = this.dataSource.getRepository(Permission);

    // Clear existing permissions with CASCADE
    await this.dataSource.query('TRUNCATE TABLE "permissions" CASCADE');
    console.log("Cleared existing permissions");

    // Create permissions
    const permissions = Object.values(PERMISSION_TYPE).map(permissionType => {
      return permissionRepository.create({
        name: permissionType,
        description: this.getPermissionDescription(permissionType)
      });
    });

    // Save permissions
    await this.saveMany(permissions, Permission);
    console.log("Permissions seeded successfully");
  }

  private getPermissionDescription(permission: PERMISSION_TYPE): string {
    const descriptions: Record<PERMISSION_TYPE, string> = {
      // Product permissions
      [PERMISSION_TYPE.CREATE_PRODUCT]: "Can create new products",
      [PERMISSION_TYPE.READ_PRODUCT]: "Can view products",
      [PERMISSION_TYPE.UPDATE_PRODUCT]: "Can update existing products",
      [PERMISSION_TYPE.DELETE_PRODUCT]: "Can delete products",
      [PERMISSION_TYPE.MANAGE_PRODUCT_CATEGORIES]: "Can manage product categories",
      
      // Category permissions
      [PERMISSION_TYPE.CREATE_CATEGORY]: "Can create new categories",
      [PERMISSION_TYPE.READ_CATEGORY]: "Can view categories",
      [PERMISSION_TYPE.UPDATE_CATEGORY]: "Can update existing categories",
      [PERMISSION_TYPE.DELETE_CATEGORY]: "Can delete categories",
      [PERMISSION_TYPE.MANAGE_CATEGORIES]: "Can manage all categories",
      
      // Order permissions
      [PERMISSION_TYPE.CREATE_ORDER]: "Can create new orders",
      [PERMISSION_TYPE.READ_ORDER]: "Can view orders",
      [PERMISSION_TYPE.UPDATE_ORDER]: "Can update existing orders",
      [PERMISSION_TYPE.DELETE_ORDER]: "Can delete orders",
      [PERMISSION_TYPE.MANAGE_ORDERS]: "Can manage all orders",
      
      // User permissions
      [PERMISSION_TYPE.CREATE_USER]: "Can create new users",
      [PERMISSION_TYPE.READ_USER]: "Can view users",
      [PERMISSION_TYPE.UPDATE_USER]: "Can update existing users",
      [PERMISSION_TYPE.DELETE_USER]: "Can delete users",
      [PERMISSION_TYPE.MANAGE_USERS]: "Can manage all users",
      
      // Role permissions
      [PERMISSION_TYPE.CREATE_ROLE]: "Can create new roles",
      [PERMISSION_TYPE.READ_ROLE]: "Can view roles",
      [PERMISSION_TYPE.UPDATE_ROLE]: "Can update existing roles",
      [PERMISSION_TYPE.DELETE_ROLE]: "Can delete roles",
      [PERMISSION_TYPE.MANAGE_ROLES]: "Can manage all roles",
      
      // Store permissions
      [PERMISSION_TYPE.MANAGE_STORE]: "Can manage store settings",
      [PERMISSION_TYPE.MANAGE_STORE_SETTINGS]: "Can manage store settings",
      [PERMISSION_TYPE.MANAGE_STORE_INVENTORY]: "Can manage store inventory",
      
      // Payment permissions
      [PERMISSION_TYPE.MANAGE_PAYMENTS]: "Can manage payments",
      [PERMISSION_TYPE.PROCESS_PAYMENTS]: "Can process payments",
      [PERMISSION_TYPE.REFUND_PAYMENTS]: "Can process refunds",
      
      // Shipping permissions
      [PERMISSION_TYPE.MANAGE_SHIPPING]: "Can manage shipping",
      [PERMISSION_TYPE.PROCESS_SHIPPING]: "Can process shipping",
      [PERMISSION_TYPE.TRACK_SHIPPING]: "Can track shipping",
      
      // Review permissions
      [PERMISSION_TYPE.CREATE_REVIEW]: "Can create reviews",
      [PERMISSION_TYPE.READ_REVIEW]: "Can view reviews",
      [PERMISSION_TYPE.UPDATE_REVIEW]: "Can update reviews",
      [PERMISSION_TYPE.DELETE_REVIEW]: "Can delete reviews",
      [PERMISSION_TYPE.MANAGE_REVIEWS]: "Can manage all reviews",
      
      // Discount permissions
      [PERMISSION_TYPE.MANAGE_DISCOUNTS]: "Can manage discounts",
      [PERMISSION_TYPE.CREATE_DISCOUNT]: "Can create discounts",
      [PERMISSION_TYPE.UPDATE_DISCOUNT]: "Can update discounts",
      [PERMISSION_TYPE.DELETE_DISCOUNT]: "Can delete discounts"
    };

    return descriptions[permission] || "No description available";
  }
} 