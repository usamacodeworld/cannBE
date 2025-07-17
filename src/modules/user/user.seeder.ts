import { DataSource } from "typeorm";
import { BaseSeeder } from "../../common/seeders/base.seeder";
import { User } from "./user.entity";
import { Role } from "../role/entities/role.entity";
import { USER_TYPE } from "../../constants/user";

export class UserSeeder extends BaseSeeder {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const userRepository = this.dataSource.getRepository(User);
    const roleRepository = this.dataSource.getRepository(Role);

    // Clear existing users with CASCADE
    await this.dataSource.query('TRUNCATE TABLE "users" CASCADE');
    console.log("Cleared existing users");

    // Get roles
    const superAdminRole = await roleRepository.findOne({ where: { name: "Super Admin" } });
    const storeAdminRole = await roleRepository.findOne({ where: { name: "Store Admin" } });
    const storeManagerRole = await roleRepository.findOne({ where: { name: "Store Manager" } });
    const sellerRole = await roleRepository.findOne({ where: { name: "Seller" } });
    const customerRole = await roleRepository.findOne({ where: { name: "Customer" } });

    if (!superAdminRole || !storeAdminRole || !storeManagerRole || !sellerRole || !customerRole) {
      throw new Error("Required roles not found. Please run role seeder first.");
    }

    // Create admin user
    const adminUser = userRepository.create({
      firstName: "Admin",
      lastName: "User",
      userName: "admin",
      email: "admin@example.com",
      password: "password",
      phone: "+1234567890",
      emailVerified: true,
      isActive: true,
      type: USER_TYPE.ADMIN,
      roles: [superAdminRole]  // Super Admin role already has all permissions
    });

    // Create store admin
    const storeAdminUser = userRepository.create({
      firstName: "Store",
      lastName: "Admin",
      userName: "storeadmin",
      email: "storeadmin@example.com",
      password: "password",
      phone: "+1234567891",
      emailVerified: true,
      isActive: true,
      type: USER_TYPE.ADMIN,
      roles: [storeAdminRole]
    });

    // Create store manager
    const storeManagerUser = userRepository.create({
      firstName: "Store",
      lastName: "Manager",
      userName: "storemanager",
      email: "storemanager@example.com",
      password: "password",
      phone: "+1234567892",
      emailVerified: true,
      isActive: true,
      type: USER_TYPE.ADMIN,
      roles: [storeManagerRole]
    });

    // Create seller
    const sellerUser = userRepository.create({
      firstName: "John",
      lastName: "Seller",
      userName: "seller",
      email: "seller@example.com",
      password: "password",
      phone: "+1234567893",
      emailVerified: true,
      isActive: true,
      type: USER_TYPE.SELLER,
      roles: [sellerRole]
    });

    // Create customer
    const customerUser = userRepository.create({
      firstName: "John",
      lastName: "Customer",
      userName: "customer",
      email: "customer@example.com",
      password: "password",
      phone: "+1234567894",
      emailVerified: true,
      isActive: true,
      type: USER_TYPE.BUYER,
      roles: [customerRole]
    });

    // Save users one by one to ensure roles are properly saved
    await userRepository.save(adminUser);
    await userRepository.save(storeAdminUser);
    await userRepository.save(storeManagerUser);
    await userRepository.save(sellerUser);
    await userRepository.save(customerUser);
    
    console.log("Users seeded successfully");
  }
}
