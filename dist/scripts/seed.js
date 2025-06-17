"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const seeder_runner_1 = require("../common/seeders/seeder.runner");
async function seed() {
    try {
        const seederRunner = new seeder_runner_1.SeederRunner();
        await seederRunner.run();
        console.log('Seeding completed successfully');
        process.exit(0);
    }
    catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}
seed();
