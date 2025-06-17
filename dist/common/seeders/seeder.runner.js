"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeederRunner = void 0;
const seeder_config_1 = require("../../config/seeder.config");
const user_seeder_1 = require("../../modules/user/seeders/user.seeder");
const role_seeder_1 = require("../../modules/role/seeders/role.seeder");
const permission_seeder_1 = require("../../modules/permissions/seeders/permission.seeder");
const category_seeder_1 = require("../../modules/category/seeders/category.seeder");
class SeederRunner {
    constructor() {
        this.dataSource = seeder_config_1.AppSeederDataSource;
    }
    async run() {
        try {
            // Initialize database connection
            await this.dataSource.initialize();
            console.log('Database connection initialized');
            // Run seeders
            await this.runSeeders();
            // Close database connection
            await this.dataSource.destroy();
            console.log('Database connection closed');
        }
        catch (error) {
            console.error('Error running seeders:', error);
            throw error;
        }
    }
    async runSeeders() {
        // Add seeders here in the order you want them to run
        const seeders = [
            new permission_seeder_1.PermissionSeeder(this.dataSource),
            new role_seeder_1.RoleSeeder(this.dataSource),
            new user_seeder_1.UserSeeder(this.dataSource),
            new category_seeder_1.CategorySeeder(this.dataSource),
        ];
        for (const seeder of seeders) {
            console.log(`Running ${seeder.constructor.name}...`);
            await seeder.run();
            console.log(`${seeder.constructor.name} completed`);
        }
    }
}
exports.SeederRunner = SeederRunner;
