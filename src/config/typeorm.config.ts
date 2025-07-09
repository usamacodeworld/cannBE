import { DataSource, DataSourceOptions } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

export const typeormConfig: DataSourceOptions = {
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "cannbe",
  synchronize: process.env.NODE_ENV !== "production",
  logging: process.env.NODE_ENV !== "production",
  entities: [
    "src/modules/**/entities/*.entity.ts",
    "src/modules/role/entities/role.entity.ts",
    "src/modules/permissions/entities/permission.entity.ts",
    "src/modules/user/user.entity.ts",
    "src/modules/category/category.entity.ts",
    "src/modules/attributes/entities/attribute.entity.ts",
    "src/modules/attributes/entities/attribute-value.entity.ts",
    "src/modules/products/entities/product.entity.ts",
    "src/modules/products/entities/product-variant.entity.ts",
    "src/modules/media/media-file.entity.ts",
    "src/modules/cart/entities/cart.entity.ts",
    "src/modules/checkout/entities/order.entity.ts",
    "src/modules/checkout/entities/order-item.entity.ts",
    "src/modules/checkout/entities/order-status-history.entity.ts",
    "src/modules/checkout/entities/shipping-address.entity.ts",
    "src/modules/checkout/entities/coupon.entity.ts",
    "src/modules/address/address.entity.ts",
  ],
  migrations: ["src/migrations/*.ts"],
  subscribers: ["src/subscribers/*.ts"],
  ssl:
    process.env.DB_SSL === "true"
      ? {
          rejectUnauthorized: false,
        }
      : false,
};

export const dataSource = new DataSource(typeormConfig);
