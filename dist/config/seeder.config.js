"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppSeederDataSource = exports.seederConfig = void 0;
const typeorm_1 = require("typeorm");
const typeorm_config_1 = require("./typeorm.config");
exports.seederConfig = {
    ...typeorm_config_1.typeormConfig,
    synchronize: true, // Enable this only for seeding
    logging: true
};
exports.AppSeederDataSource = new typeorm_1.DataSource(exports.seederConfig);
