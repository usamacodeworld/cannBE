import { DataSource, DataSourceOptions } from 'typeorm';
import { typeormConfig } from './typeorm.config';

export const seederConfig: DataSourceOptions = {
  ...typeormConfig,
  synchronize: true, // Enable this only for seeding
  logging: true
};

export const AppSeederDataSource = new DataSource(seederConfig); 