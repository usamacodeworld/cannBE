import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "rootp",
  database: process.env.DB_NAME || "cannbe",
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
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
  ],
  migrations: ["src/migrations/*.ts"],
  subscribers: ["src/subscribers/*.ts"],
});
