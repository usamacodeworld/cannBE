"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryController = categoryController;
const category_service_1 = require("./category.service");
const uuid_1 = require("uuid");
function categoryController(categoryRepository) {
    const categoryService = new category_service_1.CategoryService(categoryRepository);
    return {
        createCategory: async (req, res) => {
            try {
                const category = await categoryService.create(req.body);
                res.status(201).json({
                    message: "Category created successfully",
                    requestId: (0, uuid_1.v4)(),
                    data: category,
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
        getCategories: async (req, res) => {
            try {
                const query = req.query;
                const categories = await categoryService.findAll(query);
                res.json({
                    message: "Categories retrieved successfully",
                    requestId: (0, uuid_1.v4)(),
                    data: categories,
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
        getCategory: async (req, res) => {
            try {
                const category = await categoryService.findOne(req.params.id);
                res.json({
                    message: "Category retrieved successfully",
                    requestId: (0, uuid_1.v4)(),
                    data: category,
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
        updateCategory: async (req, res) => {
            try {
                const category = await categoryService.update(req.params.id, req.body);
                res.json({
                    message: "Category updated successfully",
                    requestId: (0, uuid_1.v4)(),
                    data: category,
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
        deleteCategory: async (req, res) => {
            try {
                await categoryService.remove(req.params.id);
                res.status(200).json({
                    message: "Category deleted successfully",
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
        getParentCategories: async (req, res) => {
            try {
                const query = req.query;
                const categories = await categoryService.findParentCategories(query);
                res.json({
                    message: "Parent categories retrieved successfully",
                    requestId: (0, uuid_1.v4)(),
                    data: categories,
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
        getSubCategories: async (req, res) => {
            try {
                const query = req.query;
                const categories = await categoryService.findSubCategories(req.params.id, query);
                res.json({
                    message: "Sub categories retrieved successfully",
                    requestId: (0, uuid_1.v4)(),
                    data: categories,
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
        }
    };
}
