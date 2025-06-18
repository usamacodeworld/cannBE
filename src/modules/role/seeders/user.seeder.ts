import { DataSource } from "typeorm";
import { BaseSeeder } from "../../../common/seeders/base.seeder";
import { User } from "../../user/user.entity";

export class UserSeeder extends BaseSeeder {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const userRepository = this.dataSource.getRepository(User);

    // Clear existing users
    await userRepository.clear();
    console.log("Cleared existing users");

    // Create admin user
    const adminUser = userRepository.create({
      firstName: "Admin",
      lastName: "User",
      userName: "admin",
      email: "admin@example.com",
      password: "password",
      phone: "+1234567890",
      emailVerified: true,
      type: "admin",
    });

    // Create regular user
    const regularUser = userRepository.create({
      firstName: "Regular",
      lastName: "User",
      userName: "user",
      email: "user@example.com",
      password: "password",
      phone: "+0987654321",
      emailVerified: true,
      type: "buyer",
    });

    // Create regular user
    const sellerUser = userRepository.create({
      firstName: "Regular",
      lastName: "Seller",
      userName: "user",
      email: "user@example.com",
      password: "password",
      phone: "+0987654321",
      emailVerified: true,
      type: "seller",
    });

    // Save users using the base seeder methods
    await this.saveMany([adminUser, regularUser, sellerUser], User);
    console.log("Users seeded successfully");
  }
}
