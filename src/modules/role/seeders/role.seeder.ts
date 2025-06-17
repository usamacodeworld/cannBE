import { DataSource } from "typeorm";
import { BaseSeeder } from "../../../common/seeders/base.seeder";
import { Role } from "../entities/role.entity";
import { Permission, PERMISSION_TYPE } from "../../permissions/entities/permission.entity";

export class RoleSeeder extends BaseSeeder {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const roleRepository = this.dataSource.getRepository(Role);
    const permissionRepository = this.dataSource.getRepository(Permission);

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
        permissions: permissions.filter(p => 
          p.name !== PERMISSION_TYPE.MANAGE_ROLES &&
          p.name !== PERMISSION_TYPE.CREATE_ROLE &&
          p.name !== PERMISSION_TYPE.UPDATE_ROLE &&
          p.name !== PERMISSION_TYPE.DELETE_ROLE
        )
      },
      {
        name: "Store Manager",
        description: "Can manage store inventory and orders",
        permissions: permissions.filter(p => 
          p.name === PERMISSION_TYPE.MANAGE_STORE_INVENTORY ||
          p.name === PERMISSION_TYPE.MANAGE_ORDERS ||
          p.name === PERMISSION_TYPE.PROCESS_SHIPPING ||
          p.name === PERMISSION_TYPE.TRACK_SHIPPING ||
          p.name === PERMISSION_TYPE.MANAGE_REVIEWS ||
          p.name === PERMISSION_TYPE.MANAGE_DISCOUNTS
        )
      },
      {
        name: "Seller",
        description: "Can manage their own products and orders",
        permissions: permissions.filter(p => 
          p.name === PERMISSION_TYPE.CREATE_PRODUCT ||
          p.name === PERMISSION_TYPE.READ_PRODUCT ||
          p.name === PERMISSION_TYPE.UPDATE_PRODUCT ||
          p.name === PERMISSION_TYPE.DELETE_PRODUCT ||
          p.name === PERMISSION_TYPE.READ_ORDER ||
          p.name === PERMISSION_TYPE.UPDATE_ORDER ||
          p.name === PERMISSION_TYPE.PROCESS_SHIPPING ||
          p.name === PERMISSION_TYPE.TRACK_SHIPPING ||
          p.name === PERMISSION_TYPE.READ_REVIEW ||
          p.name === PERMISSION_TYPE.MANAGE_REVIEWS
        )
      },
      {
        name: "Customer",
        description: "Can place orders and manage their account",
        permissions: permissions.filter(p => 
          p.name === PERMISSION_TYPE.CREATE_ORDER ||
          p.name === PERMISSION_TYPE.READ_ORDER ||
          p.name === PERMISSION_TYPE.CREATE_REVIEW ||
          p.name === PERMISSION_TYPE.READ_REVIEW ||
          p.name === PERMISSION_TYPE.TRACK_SHIPPING
        )
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