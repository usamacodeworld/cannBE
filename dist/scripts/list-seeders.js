"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const seeder_runner_1 = require("../common/seeders/seeder.runner");
async function listSeeders() {
    try {
        const seederRunner = new seeder_runner_1.SeederRunner();
        const availableSeeders = seederRunner.listAvailableSeeders();
        console.log('Available seeders:');
        console.log('==================');
        availableSeeders.forEach((seeder, index) => {
            console.log(`${index + 1}. ${seeder}`);
        });
        console.log('\nUsage:');
        console.log('npm run seed                    # Run all seeders');
        console.log('npm run seed:permissions        # Run permissions seeder');
        console.log('npm run seed:roles             # Run roles seeder');
        console.log('npm run seed:users             # Run users seeder');
        console.log('npm run seed:categories        # Run categories seeder');
        console.log('npm run seed:attributes        # Run attributes seeder');
        console.log('npm run seed:attribute-values  # Run attribute-values seeder');
        console.log('npm run seed:products          # Run products seeder');
        console.log('\nOr use: ts-node src/scripts/seed.ts <seeder-name>');
        process.exit(0);
    }
    catch (error) {
        console.error('Error listing seeders:', error);
        process.exit(1);
    }
}
listSeeders();
