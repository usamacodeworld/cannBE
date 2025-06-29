import { DataSource } from 'typeorm';
import { AppSeederDataSource } from '../../config/seeder.config';
import { UserSeeder } from '../../modules/user/seeders/user.seeder';
import { RoleSeeder } from '../../modules/role/seeders/role.seeder';
import { PermissionSeeder } from '../../modules/permissions/seeders/permission.seeder';

export class SeederRunner {
  private dataSource: DataSource;

  constructor() {
    this.dataSource = AppSeederDataSource;
  }

  async run(): Promise<void> {
    try {
      // Initialize database connection
      await this.dataSource.initialize();
      console.log('Database connection initialized');

      // Run seeders
      await this.runSeeders();

      // Close database connection
      await this.dataSource.destroy();
      console.log('Database connection closed');
    } catch (error) {
      console.error('Error running seeders:', error);
      throw error;
    }
  }

  private async runSeeders(): Promise<void> {
    // Add seeders here in the order you want them to run
    const seeders = [
      new PermissionSeeder(this.dataSource),
      new RoleSeeder(this.dataSource),
      new UserSeeder(this.dataSource),
    ];

    for (const seeder of seeders) {
      console.log(`Running ${seeder.constructor.name}...`);
      await seeder.run();
      console.log(`${seeder.constructor.name} completed`);
    }
  }
} 