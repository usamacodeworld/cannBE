import { DataSource, DataSourceOptions } from "typeorm";
import { User } from "../modules/user/user.entity";
import { Role } from "../modules/role/entities/role.entity";
import { Permission } from "../modules/permissions/entities/permission.entity";
import { Category } from "../modules/category/category.entity";
import { Attribute } from "../modules/attributes/entities/attribute.entity";
import { AttributeValue } from "../modules/attributes/entities/attribute-value.entity";
import { Product } from "../modules/products/entities/product.entity";
import { ProductVariant } from "../modules/products/entities/product-variant.entity";
import { Country } from "../modules/country/country.entity";
import { MediaFile } from "../modules/media/media-file.entity";

export const seederConfig: DataSourceOptions = {
  ...require("./typeorm.config").typeormConfig,
  entities: [
    User,
    Role,
    Permission,
    Category,
    Attribute,
    AttributeValue,
    Product,
    ProductVariant,
    Country,
    MediaFile,
  ],
  synchronize: true, // Enable this only for seeding
  logging: true,
};

export const AppSeederDataSource = new DataSource(seederConfig);
