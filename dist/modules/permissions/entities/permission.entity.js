"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Permission = exports.PERMISSION_TYPE = void 0;
const base_entity_1 = require("../../../common/entities/base.entity");
const role_entity_1 = require("../../../modules/role/entities/role.entity");
const typeorm_1 = require("typeorm");
var PERMISSION_TYPE;
(function (PERMISSION_TYPE) {
    // Product permissions
    PERMISSION_TYPE["CREATE_PRODUCT"] = "create:product";
    PERMISSION_TYPE["READ_PRODUCT"] = "read:product";
    PERMISSION_TYPE["UPDATE_PRODUCT"] = "update:product";
    PERMISSION_TYPE["DELETE_PRODUCT"] = "delete:product";
    PERMISSION_TYPE["MANAGE_PRODUCT_CATEGORIES"] = "manage:product:categories";
    // Category permissions
    PERMISSION_TYPE["CREATE_CATEGORY"] = "create:category";
    PERMISSION_TYPE["READ_CATEGORY"] = "read:category";
    PERMISSION_TYPE["UPDATE_CATEGORY"] = "update:category";
    PERMISSION_TYPE["DELETE_CATEGORY"] = "delete:category";
    PERMISSION_TYPE["MANAGE_CATEGORIES"] = "manage:categories";
    // Order permissions
    PERMISSION_TYPE["CREATE_ORDER"] = "create:order";
    PERMISSION_TYPE["READ_ORDER"] = "read:order";
    PERMISSION_TYPE["UPDATE_ORDER"] = "update:order";
    PERMISSION_TYPE["DELETE_ORDER"] = "delete:order";
    PERMISSION_TYPE["MANAGE_ORDERS"] = "manage:orders";
    // User permissions
    PERMISSION_TYPE["CREATE_USER"] = "create:user";
    PERMISSION_TYPE["READ_USER"] = "read:user";
    PERMISSION_TYPE["UPDATE_USER"] = "update:user";
    PERMISSION_TYPE["DELETE_USER"] = "delete:user";
    PERMISSION_TYPE["MANAGE_USERS"] = "manage:users";
    // Role permissions
    PERMISSION_TYPE["CREATE_ROLE"] = "create:role";
    PERMISSION_TYPE["READ_ROLE"] = "read:role";
    PERMISSION_TYPE["UPDATE_ROLE"] = "update:role";
    PERMISSION_TYPE["DELETE_ROLE"] = "delete:role";
    PERMISSION_TYPE["MANAGE_ROLES"] = "manage:roles";
    // Store permissions
    PERMISSION_TYPE["MANAGE_STORE"] = "manage:store";
    PERMISSION_TYPE["MANAGE_STORE_SETTINGS"] = "manage:store:settings";
    PERMISSION_TYPE["MANAGE_STORE_INVENTORY"] = "manage:store:inventory";
    // Payment permissions
    PERMISSION_TYPE["MANAGE_PAYMENTS"] = "manage:payments";
    PERMISSION_TYPE["PROCESS_PAYMENTS"] = "process:payments";
    PERMISSION_TYPE["REFUND_PAYMENTS"] = "refund:payments";
    // Shipping permissions
    PERMISSION_TYPE["MANAGE_SHIPPING"] = "manage:shipping";
    PERMISSION_TYPE["PROCESS_SHIPPING"] = "process:shipping";
    PERMISSION_TYPE["TRACK_SHIPPING"] = "track:shipping";
    // Review permissions
    PERMISSION_TYPE["CREATE_REVIEW"] = "create:review";
    PERMISSION_TYPE["READ_REVIEW"] = "read:review";
    PERMISSION_TYPE["UPDATE_REVIEW"] = "update:review";
    PERMISSION_TYPE["DELETE_REVIEW"] = "delete:review";
    PERMISSION_TYPE["MANAGE_REVIEWS"] = "manage:reviews";
    // Discount permissions
    PERMISSION_TYPE["MANAGE_DISCOUNTS"] = "manage:discounts";
    PERMISSION_TYPE["CREATE_DISCOUNT"] = "create:discount";
    PERMISSION_TYPE["UPDATE_DISCOUNT"] = "update:discount";
    PERMISSION_TYPE["DELETE_DISCOUNT"] = "delete:discount";
})(PERMISSION_TYPE || (exports.PERMISSION_TYPE = PERMISSION_TYPE = {}));
let Permission = class Permission extends base_entity_1.BaseEntity {
};
exports.Permission = Permission;
__decorate([
    (0, typeorm_1.Column)({ unique: true, enum: PERMISSION_TYPE }),
    __metadata("design:type", String)
], Permission.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Permission.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => role_entity_1.Role, role => role.permissions),
    __metadata("design:type", Array)
], Permission.prototype, "roles", void 0);
exports.Permission = Permission = __decorate([
    (0, typeorm_1.Entity)({ name: "permissions" })
], Permission);
