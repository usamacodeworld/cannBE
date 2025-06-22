"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../../config/database");
const product_entity_1 = require("./entities/product.entity");
const product_variant_entity_1 = require("./entities/product-variant.entity");
const product_controller_1 = require("./product.controller");
const validation_middleware_1 = require("../../common/middlewares/validation.middleware");
const create_product_dto_1 = require("./dto/create-product.dto");
const update_product_dto_1 = require("./dto/update-product.dto");
const create_product_variant_dto_1 = require("./dto/create-product-variant.dto");
const update_product_variant_dto_1 = require("./dto/update-product-variant.dto");
const router = (0, express_1.Router)();
const productRepository = database_1.AppDataSource.getRepository(product_entity_1.Product);
const variantRepository = database_1.AppDataSource.getRepository(product_variant_entity_1.ProductVariant);
const ctrl = (0, product_controller_1.productController)(productRepository, variantRepository);
// Product CRUD
router.post('/', (0, validation_middleware_1.validateDto)(create_product_dto_1.CreateProductDto), ctrl.createProduct);
router.get('/', ctrl.getProducts);
router.get('/:id', ctrl.getProduct);
router.put('/:id', (0, validation_middleware_1.validateDto)(update_product_dto_1.UpdateProductDto), ctrl.updateProduct);
router.delete('/:id', ctrl.deleteProduct);
// Product Variant CRUD (nested under product)
router.post('/:productId/variants', (0, validation_middleware_1.validateDto)(create_product_variant_dto_1.CreateProductVariantDto), ctrl.createVariant);
router.get('/:productId/variants', ctrl.getVariants);
// Single variant endpoints
router.get('/variants/:variantId', ctrl.getVariant);
router.put('/variants/:variantId', (0, validation_middleware_1.validateDto)(update_product_variant_dto_1.UpdateProductVariantDto), ctrl.updateVariant);
router.delete('/variants/:variantId', ctrl.deleteVariant);
exports.default = router;
