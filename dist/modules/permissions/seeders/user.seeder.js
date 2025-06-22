"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSeeder = void 0;
const base_seeder_1 = require("../../../common/seeders/base.seeder");
const user_entity_1 = require("../../user/user.entity");
class UserSeeder extends base_seeder_1.BaseSeeder {
    constructor(dataSource) {
        super(dataSource);
    }
    async run() {
        const userRepository = this.dataSource.getRepository(user_entity_1.User);
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
        await this.saveMany([adminUser, regularUser, sellerUser], user_entity_1.User);
        console.log("Users seeded successfully");
    }
}
exports.UserSeeder = UserSeeder;
