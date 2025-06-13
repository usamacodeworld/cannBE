import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../modules/user/entities/user.entity';
import dotenv from 'dotenv';

dotenv.config();

export const typeormConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'cannbe',
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
  entities: [User],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false
}; 