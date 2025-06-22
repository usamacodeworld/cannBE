"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
const express_1 = require("express");
const user_routes_1 = __importDefault(require("./modules/role/routes/user.routes"));
const category_routes_1 = __importDefault(require("./modules/category/category.routes"));
const attribute_routes_1 = __importDefault(require("./modules/attributes/attribute.routes"));
const product_routes_1 = __importDefault(require("./modules/products/product.routes"));
const Router = (0, express_1.Router)();
exports.Router = Router;
Router.use("/", user_routes_1.default, category_routes_1.default, attribute_routes_1.default, product_routes_1.default);
