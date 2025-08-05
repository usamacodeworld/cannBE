import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

const isCompiled = __dirname.includes("dist");

console.log(`📦 Loading TypeORM files from ${isCompiled ? "dist" : "src"}`);

const basePath = isCompiled ? "dist" : "src";
const extension = isCompiled ? "js" : "ts";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "rootp",
  database: process.env.DB_NAME || "cannbe",
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,

  entities: [
    `${basePath}/modules/role/entities/role.entity.${extension}`,
    `${basePath}/modules/permissions/entities/permission.entity.${extension}`,
    `${basePath}/modules/user/user.entity.${extension}`,
    `${basePath}/modules/category/category.entity.${extension}`,
    `${basePath}/modules/country/country.entity.${extension}`,
    `${basePath}/modules/attributes/entities/attribute.entity.${extension}`,
    `${basePath}/modules/attributes/entities/attribute-value.entity.${extension}`,
    `${basePath}/modules/products/entities/product.entity.${extension}`,
    `${basePath}/modules/media/media-file.entity.${extension}`,
    `${basePath}/modules/cart/entities/cart.entity.${extension}`,
    `${basePath}/modules/checkout/entities/order.entity.${extension}`,
    `${basePath}/modules/checkout/entities/order-item.entity.${extension}`,
    `${basePath}/modules/checkout/entities/order-status-history.entity.${extension}`,
    `${basePath}/modules/checkout/entities/shipping-address.entity.${extension}`,
    `${basePath}/modules/coupon/coupon.entity.${extension}`,
    `${basePath}/modules/address/address.entity.${extension}`,
    `${basePath}/modules/seller/entities/seller.entity.${extension}`,
    `${basePath}/modules/shipping/shipping-zone.entity.${extension}`,
    `${basePath}/modules/shipping/shipping-method.entity.${extension}`,
    `${basePath}/modules/shipping/shipping-rate.entity.${extension}`,
    `${basePath}/modules/category-restrictions/category-restriction.entity.${extension}`,
  ],

  migrations: [`${basePath}/migrations/*.${extension}`],
  subscribers: [`${basePath}/subscribers/*.${extension}`],
});
