"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeederRunner = void 0;
const seeder_config_1 = require("../../config/seeder.config");
const user_seeder_1 = require("../../modules/user/user.seeder");
const role_seeder_1 = require("../../modules/role/seeders/role.seeder");
const permission_seeder_1 = require("../../modules/permissions/seeders/permission.seeder");
const category_seeder_1 = require("../../modules/category/category.seeder");
const attribute_seeder_1 = require("../../modules/attributes/seeders/attribute.seeder");
const attribute_value_seeder_1 = require("../../modules/attributes/seeders/attribute-value.seeder");
const product_seeder_1 = require("../../modules/products/seeders/product.seeder");
class SeederRunner {
    constructor() {
        this.dataSource = seeder_config_1.AppSeederDataSource;
        this.initializeSeederRegistry();
    }
    initializeSeederRegistry() {
        this.seederRegistry = new Map();
        // Register all seeders with their names
        this.seederRegistry.set('permissions', new permission_seeder_1.PermissionSeeder(this.dataSource));
        this.seederRegistry.set('roles', new role_seeder_1.RoleSeeder(this.dataSource));
        this.seederRegistry.set('users', new user_seeder_1.UserSeeder(this.dataSource));
        this.seederRegistry.set('categories', new category_seeder_1.CategorySeeder(this.dataSource));
        this.seederRegistry.set('attributes', new attribute_seeder_1.AttributeSeeder(this.dataSource));
        this.seederRegistry.set('attribute-values', new attribute_value_seeder_1.AttributeValueSeeder(this.dataSource));
        this.seederRegistry.set('products', new product_seeder_1.ProductSeeder(this.dataSource));
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
    async runSpecificSeeder(seederName) {
        try {
            // Initialize database connection
            await this.dataSource.initialize();
            console.log('Database connection initialized');
            const seeder = this.seederRegistry.get(seederName.toLowerCase());
            if (!seeder) {
                const availableSeeders = Array.from(this.seederRegistry.keys()).join(', ');
                throw new Error(`Seeder '${seederName}' not found. Available seeders: ${availableSeeders}`);
            }
            console.log(`Running ${seeder.constructor.name}...`);
            await seeder.run();
            console.log(`${seeder.constructor.name} completed`);
            // Close database connection
            await this.dataSource.destroy();
            console.log('Database connection closed');
        }
        catch (error) {
            console.error('Error running specific seeder:', error);
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
            new attribute_seeder_1.AttributeSeeder(this.dataSource),
            new attribute_value_seeder_1.AttributeValueSeeder(this.dataSource),
            new product_seeder_1.ProductSeeder(this.dataSource),
        ];
        for (const seeder of seeders) {
            console.log(`Running ${seeder.constructor.name}...`);
            await seeder.run();
            console.log(`${seeder.constructor.name} completed`);
        }
    }
    // Method to list available seeders
    listAvailableSeeders() {
        return Array.from(this.seederRegistry.keys());
    }
}
exports.SeederRunner = SeederRunner;
