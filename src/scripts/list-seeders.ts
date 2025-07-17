import { SeederRunner } from '../common/seeders/seeder.runner';

async function listSeeders() {
  try {
    const seederRunner = new SeederRunner();
    const availableSeeders = seederRunner.listAvailableSeeders();
    
    console.log('Available seeders:');
    console.log('==================');
    availableSeeders.forEach((seeder, index) => {
      console.log(`${index + 1}. ${seeder}`);
    });
    console.log('\nUsage:');
    console.log('npm run seed                    # Run all seeders');
    console.log('npm run seed <seeder-name>      # Run specific seeder');
    console.log('npm run seed:list               # List all available seeders');
    console.log('\nExamples:');
    console.log('npm run seed permissions        # Run permissions seeder');
    console.log('npm run seed users              # Run users seeder');
    console.log('npm run seed categories         # Run categories seeder');
    
    process.exit(0);
  } catch (error) {
    console.error('Error listing seeders:', error);
    process.exit(1);
  }
}

listSeeders(); 