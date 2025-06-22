"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppSeederDataSource = exports.seederConfig = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../modules/user/user.entity");
const role_entity_1 = require("../modules/role/entities/role.entity");
const permission_entity_1 = require("../modules/permissions/entities/permission.entity");
const category_entity_1 = require("../modules/category/category.entity");
const attribute_entity_1 = require("../modules/attributes/entities/attribute.entity");
const attribute_value_entity_1 = require("../modules/attributes/entities/attribute-value.entity");
const product_entity_1 = require("../modules/products/entities/product.entity");
const product_variant_entity_1 = require("../modules/products/entities/product-variant.entity");
exports.seederConfig = {
    ...require('./typeorm.config').typeormConfig,
    entities: [user_entity_1.User, role_entity_1.Role, permission_entity_1.Permission, category_entity_1.Category, attribute_entity_1.Attribute, attribute_value_entity_1.AttributeValue, product_entity_1.Product, product_variant_entity_1.ProductVariant],
    synchronize: true, // Enable this only for seeding
    logging: true
};
exports.AppSeederDataSource = new typeorm_1.DataSource(exports.seederConfig);
