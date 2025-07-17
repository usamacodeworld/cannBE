import { BaseEntity } from "../../../common/entities/base.entity";
import { Role } from "../../../modules/role/entities/role.entity";
import { Entity, Column, ManyToMany } from "typeorm";

export enum PERMISSION_TYPE {
  // Product permissions
  CREATE_PRODUCT = "create:product",
  READ_PRODUCT = "read:product",
  UPDATE_PRODUCT = "update:product",
  DELETE_PRODUCT = "delete:product",
  MANAGE_PRODUCT_CATEGORIES = "manage:product:categories",

  // Category permissions
  CREATE_CATEGORY = "create:category",
  READ_CATEGORY = "read:category",
  UPDATE_CATEGORY = "update:category",
  DELETE_CATEGORY = "delete:category",
  MANAGE_CATEGORIES = "manage:categories",

  // Order permissions
  CREATE_ORDER = "create:order",
  READ_ORDER = "read:order",
  UPDATE_ORDER = "update:order",
  DELETE_ORDER = "delete:order",
  MANAGE_ORDERS = "manage:orders",

  // User permissions
  CREATE_USER = "create:user",
  READ_USER = "read:user",
  UPDATE_USER = "update:user",
  DELETE_USER = "delete:user",
  MANAGE_USERS = "manage:users",

  // Role permissions
  CREATE_ROLE = "create:role",
  READ_ROLE = "read:role",
  UPDATE_ROLE = "update:role",
  DELETE_ROLE = "delete:role",
  MANAGE_ROLES = "manage:roles",

  // Store permissions
  MANAGE_STORE = "manage:store",
  MANAGE_STORE_SETTINGS = "manage:store:settings",
  MANAGE_STORE_INVENTORY = "manage:store:inventory",

  // Payment permissions
  MANAGE_PAYMENTS = "manage:payments",
  PROCESS_PAYMENTS = "process:payments",
  REFUND_PAYMENTS = "refund:payments",

  // Shipping permissions
  MANAGE_SHIPPING = "manage:shipping",
  PROCESS_SHIPPING = "process:shipping",
  TRACK_SHIPPING = "track:shipping",

  // Review permissions
  CREATE_REVIEW = "create:review",
  READ_REVIEW = "read:review",
  UPDATE_REVIEW = "update:review",
  DELETE_REVIEW = "delete:review",
  MANAGE_REVIEWS = "manage:reviews",

  // Discount permissions
  MANAGE_DISCOUNTS = "manage:discounts",
  CREATE_DISCOUNT = "create:discount",
  UPDATE_DISCOUNT = "update:discount",
  DELETE_DISCOUNT = "delete:discount",
}

@Entity({ name: "permissions" })
export class Permission extends BaseEntity {
  @Column({ unique: true, enum: PERMISSION_TYPE })
  name: PERMISSION_TYPE;

  @Column({ nullable: true })
  description?: string;

  @ManyToMany(() => Role, role => role.permissions)
  roles: Role[];
}
