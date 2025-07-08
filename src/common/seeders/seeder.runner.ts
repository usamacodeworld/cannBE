import { DataSource } from "typeorm";
import { AppSeederDataSource } from "../../config/seeder.config";
import { UserSeeder } from "../../modules/user/user.seeder";
import { RoleSeeder } from "../../modules/role/seeders/role.seeder";
import { PermissionSeeder } from "../../modules/permissions/seeders/permission.seeder";
import { CategorySeeder } from "../../modules/category/category.seeder";
import { AttributeSeeder } from "../../modules/attributes/seeders/attribute.seeder";
import { AttributeValueSeeder } from "../../modules/attributes/seeders/attribute-value.seeder";
import { ProductSeeder } from "../../modules/products/seeders/product.seeder";
import { CountrySeeder } from "../../modules/country/country.seeder";
import { BaseSeeder } from "./base.seeder";
import { AddressSeeder } from "../../modules/address/address.seeder";

export class SeederRunner {
  private dataSource: DataSource;
  private seederRegistry: Map<string, any>;

  constructor() {
    this.dataSource = AppSeederDataSource;
    this.initializeSeederRegistry();
  }

  private initializeSeederRegistry(): void {
    this.seederRegistry = new Map();

    // Register all seeders with their names
    this.seederRegistry.set(
      "permissions",
      new PermissionSeeder(this.dataSource)
    );
    this.seederRegistry.set("roles", new RoleSeeder(this.dataSource));
    this.seederRegistry.set("users", new UserSeeder(this.dataSource));
    this.seederRegistry.set("categories", new CategorySeeder(this.dataSource));
    this.seederRegistry.set("attributes", new AttributeSeeder(this.dataSource));
    this.seederRegistry.set(
      "attribute-values",
      new AttributeValueSeeder(this.dataSource)
    );
    this.seederRegistry.set("products", new ProductSeeder(this.dataSource));
    this.seederRegistry.set("countries", new CountrySeeder(this.dataSource));
    this.seederRegistry.set("addresses", new AddressSeeder(this.dataSource));
  }

  async run(): Promise<void> {
    try {
      // Initialize database connection
      await this.dataSource.initialize();
      console.log("Database connection initialized");

      // Run seeders
      await this.runSeeders();

      // Close database connection
      await this.dataSource.destroy();
      console.log("Database connection closed");
    } catch (error) {
      console.error("Error running seeders:", error);
      throw error;
    }
  }

  async runSpecificSeeder(seederName: string): Promise<void> {
    try {
      // Initialize database connection
      await this.dataSource.initialize();
      console.log("Database connection initialized");

      const seeder = this.seederRegistry.get(seederName.toLowerCase());
      if (!seeder) {
        const availableSeeders = Array.from(this.seederRegistry.keys()).join(
          ", "
        );
        throw new Error(
          `Seeder '${seederName}' not found. Available seeders: ${availableSeeders}`
        );
      }

      console.log(`Running ${seeder.constructor.name}...`);
      await seeder.run();
      console.log(`${seeder.constructor.name} completed`);

      // Close database connection
      await this.dataSource.destroy();
      console.log("Database connection closed");
    } catch (error) {
      console.error("Error running specific seeder:", error);
      throw error;
    }
  }

  private async runSeeders(): Promise<void> {
    // Add seeders here in the order you want them to run
    const seeders = [
      new PermissionSeeder(this.dataSource),
      new RoleSeeder(this.dataSource),
      new UserSeeder(this.dataSource),
      new CategorySeeder(this.dataSource),
      new AttributeSeeder(this.dataSource),
      new AttributeValueSeeder(this.dataSource),
      new ProductSeeder(this.dataSource),
      new CountrySeeder(this.dataSource),
      new AddressSeeder(this.dataSource),
    ];

    for (const seeder of seeders) {
      console.log(`Running ${seeder.constructor.name}...`);
      await seeder.run();
      console.log(`${seeder.constructor.name} completed`);
    }
  }

  // Method to list available seeders
  listAvailableSeeders(): string[] {
    return Array.from(this.seederRegistry.keys());
  }
}
