import { DataSource } from "typeorm";
import { User } from "../modules/user/user.entity";
import { Role } from "../modules/role/entities/role.entity";
import { Permission } from "../modules/permissions/entities/permission.entity";
import { Category } from "../modules/category/category.entity";
import { Country } from "../modules/country/country.entity";
import { Product } from "../modules/products/entities/product.entity";
import { Attribute } from "../modules/attributes/entities/attribute.entity";
import { AttributeValue } from "../modules/attributes/entities/attribute-value.entity";
import { MediaFile } from "../modules/media/media-file.entity";
import { Cart } from "../modules/cart/entities/cart.entity";
import { Order } from "../modules/checkout/entities/order.entity";
import { OrderItem } from "../modules/checkout/entities/order-item.entity";
import { OrderStatusHistory } from "../modules/checkout/entities/order-status-history.entity";
import { ShippingAddress } from "../modules/checkout/entities/shipping-address.entity";
import { Coupon } from "../modules/coupon/coupon.entity";
import { Address } from "../modules/address/address.entity";
import { Seller } from "../modules/seller/entities/seller.entity";
import { ShippingZone } from "../modules/shipping/shipping-zone.entity";
import { ShippingMethod } from "../modules/shipping/shipping-method.entity";
import { ShippingRate } from "../modules/shipping/shipping-rate.entity";

export const AppSeederDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "rootp",
  database: process.env.DB_NAME || "cannbe",
  synchronize: false,
  logging: false,
  entities: [
    User,
    Role,
    Permission,
    Category,
    Country,
    Product,
    Attribute,
    AttributeValue,
    MediaFile,
    Cart,
    Order,
    OrderItem,
    OrderStatusHistory,
    ShippingAddress,
    Coupon,
    Address,
    Seller,
    ShippingMethod,
    ShippingZone,
    ShippingRate,
  ],
  migrations: ["src/migrations/*.ts"],
  subscribers: [],
});
