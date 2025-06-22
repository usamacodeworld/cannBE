"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const seeder_runner_1 = require("../common/seeders/seeder.runner");
// Get command line arguments
const args = process.argv.slice(2);
const seederName = args[0]; // First argument is the seeder name
async function seed() {
    try {
        const seederRunner = new seeder_runner_1.SeederRunner();
        if (seederName) {
            console.log(`Running specific seeder: ${seederName}`);
            await seederRunner.runSpecificSeeder(seederName);
        }
        else {
            console.log('Running all seeders...');
            await seederRunner.run();
        }
        console.log('Seeding completed successfully');
        process.exit(0);
    }
    catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}
seed();
