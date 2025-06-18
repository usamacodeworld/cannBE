import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../modules/user/user.entity';
import { Role } from '../modules/role/entities/role.entity';
import { Permission } from '../modules/permissions/entities/permission.entity';
import { Category } from '../modules/category/category.entity';
import { Attribute } from '../modules/attributes/entities/attribute.entity';
import { AttributeValue } from '../modules/attributes/entities/attribute-value.entity';

export const seederConfig: DataSourceOptions = {
  ...require('./typeorm.config').typeormConfig,
  entities: [User, Role, Permission, Category, Attribute, AttributeValue],
  synchronize: true, // Enable this only for seeding
  logging: true
};

export const AppSeederDataSource = new DataSource(seederConfig); 