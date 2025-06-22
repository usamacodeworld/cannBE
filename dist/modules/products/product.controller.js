"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productController = productController;
const product_service_1 = require("./product.service");
const uuid_1 = require("uuid");
function productController(productRepository, variantRepository) {
    const productService = new product_service_1.ProductService(productRepository, variantRepository);
    return {
        createProduct: async (req, res) => {
            try {
                const product = await productService.createProduct(req.body);
                res.status(201).json({
                    message: 'Product created successfully',
                    requestId: (0, uuid_1.v4)(),
                    data: product,
                    code: 0
                });
            }
            catch (error) {
                res.status(400).json({
                    message: error.message,
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    code: 1
                });
            }
        },
        getProducts: async (req, res) => {
            try {
                const products = await productService.findAll();
                res.json({
                    message: 'Products retrieved successfully',
                    requestId: (0, uuid_1.v4)(),
                    data: products,
                    code: 0
                });
            }
            catch (error) {
                res.status(500).json({
                    message: error.message,
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    code: 1
                });
            }
        },
        getProduct: async (req, res) => {
            try {
                const product = await productService.findOne(req.params.id);
                res.json({
                    message: 'Product retrieved successfully',
                    requestId: (0, uuid_1.v4)(),
                    data: product,
                    code: 0
                });
            }
            catch (error) {
                res.status(404).json({
                    message: error.message,
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    code: 1
                });
            }
        },
        updateProduct: async (req, res) => {
            try {
                const product = await productService.updateProduct(req.params.id, req.body);
                res.json({
                    message: 'Product updated successfully',
                    requestId: (0, uuid_1.v4)(),
                    data: product,
                    code: 0
                });
            }
            catch (error) {
                res.status(400).json({
                    message: error.message,
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    code: 1
                });
            }
        },
        deleteProduct: async (req, res) => {
            try {
                await productService.removeProduct(req.params.id);
                res.status(200).json({
                    message: 'Product deleted successfully',
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    code: 0
                });
            }
            catch (error) {
                res.status(404).json({
                    message: error.message,
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    code: 1
                });
            }
        },
        // Variant endpoints
        createVariant: async (req, res) => {
            try {
                const variant = await productService.createVariant(req.params.productId, req.body);
                res.status(201).json({
                    message: 'Variant created successfully',
                    requestId: (0, uuid_1.v4)(),
                    data: variant,
                    code: 0
                });
            }
            catch (error) {
                res.status(400).json({
                    message: error.message,
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    code: 1
                });
            }
        },
        getVariants: async (req, res) => {
            try {
                const variants = await productService.findAllVariants(req.params.productId);
                res.json({
                    message: 'Variants retrieved successfully',
                    requestId: (0, uuid_1.v4)(),
                    data: variants,
                    code: 0
                });
            }
            catch (error) {
                res.status(500).json({
                    message: error.message,
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    code: 1
                });
            }
        },
        getVariant: async (req, res) => {
            try {
                const variant = await productService.findVariant(req.params.variantId);
                res.json({
                    message: 'Variant retrieved successfully',
                    requestId: (0, uuid_1.v4)(),
                    data: variant,
                    code: 0
                });
            }
            catch (error) {
                res.status(404).json({
                    message: error.message,
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    code: 1
                });
            }
        },
        updateVariant: async (req, res) => {
            try {
                const variant = await productService.updateVariant(req.params.variantId, req.body);
                res.json({
                    message: 'Variant updated successfully',
                    requestId: (0, uuid_1.v4)(),
                    data: variant,
                    code: 0
                });
            }
            catch (error) {
                res.status(400).json({
                    message: error.message,
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    code: 1
                });
            }
        },
        deleteVariant: async (req, res) => {
            try {
                await productService.removeVariant(req.params.variantId);
                res.status(200).json({
                    message: 'Variant deleted successfully',
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    code: 0
                });
            }
            catch (error) {
                res.status(404).json({
                    message: error.message,
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    code: 1
                });
            }
        },
    };
}
