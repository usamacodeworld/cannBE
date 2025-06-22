"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeormConfig = void 0;
const user_entity_1 = require("../modules/user/user.entity");
const role_entity_1 = require("../modules/role/entities/role.entity");
const permission_entity_1 = require("../modules/permissions/entities/permission.entity");
const category_entity_1 = require("../modules/category/category.entity");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.typeormConfig = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'cannbe',
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV !== 'production',
    entities: [user_entity_1.User, role_entity_1.Role, permission_entity_1.Permission, category_entity_1.Category],
    migrations: ['src/migrations/*.ts'],
    subscribers: ['src/subscribers/*.ts'],
    ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
    } : false
};
