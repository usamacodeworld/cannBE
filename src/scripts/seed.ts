import { SeederRunner } from '../common/seeders/seeder.runner';

async function seed() {
  try {
    const seederRunner = new SeederRunner();
    await seederRunner.run();
    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed(); 