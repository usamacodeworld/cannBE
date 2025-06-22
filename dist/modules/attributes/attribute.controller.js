"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attributeController = attributeController;
const attribute_service_1 = require("./attribute.service");
const uuid_1 = require("uuid");
function attributeController(attributeRepository, attributeValueRepository) {
    const attributeService = new attribute_service_1.AttributeService(attributeRepository, attributeValueRepository);
    return {
        getAllAttributes: async (req, res) => {
            try {
                const query = req.query;
                const result = await attributeService.getAllAttributes(query);
                res.json({
                    message: 'Attributes retrieved successfully',
                    requestId: (0, uuid_1.v4)(),
                    data: {
                        data: result.data,
                        meta: result.meta
                    },
                    code: 0
                });
            }
            catch (error) {
                if (error.code === '23505') {
                    return res.status(409).json({
                        message: 'Attribute name must be unique',
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        code: 1
                    });
                }
                return res.status(500).json({
                    message: error.message,
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    code: 1
                });
            }
        },
        getAttributeValues: async (req, res) => {
            try {
                const attributeId = req.params.id;
                const query = req.query;
                const result = await attributeService.getAttributeValues(attributeId, query);
                res.json({
                    message: 'Attribute values retrieved successfully',
                    requestId: (0, uuid_1.v4)(),
                    data: {
                        data: result.data,
                        meta: result.meta
                    },
                    code: 0
                });
            }
            catch (error) {
                if (error.code === '23505') {
                    return res.status(409).json({
                        message: 'Attribute name must be unique',
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        code: 1
                    });
                }
                return res.status(500).json({
                    message: error.message,
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    code: 1
                });
            }
        },
        getAttributeById: async (req, res) => {
            try {
                const attribute = await attributeService.getAttributeById(req.params.id);
                if (!attribute) {
                    return res.status(404).json({
                        message: 'Attribute not found',
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        code: 1
                    });
                }
                return res.json({
                    message: 'Attribute retrieved successfully',
                    requestId: (0, uuid_1.v4)(),
                    data: attribute,
                    code: 0
                });
            }
            catch (error) {
                if (error.code === '23505') {
                    return res.status(409).json({
                        message: 'Attribute name must be unique',
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        code: 1
                    });
                }
                return res.status(500).json({
                    message: error.message,
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    code: 1
                });
            }
        },
        createAttribute: async (req, res) => {
            try {
                const attribute = await attributeService.createAttribute(req.body);
                return res.status(201).json({
                    message: 'Attribute created successfully',
                    requestId: (0, uuid_1.v4)(),
                    data: attribute,
                    code: 0
                });
            }
            catch (error) {
                if (error.code === '23505') {
                    return res.status(409).json({
                        message: 'Attribute name must be unique',
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        code: 1
                    });
                }
                return res.status(500).json({
                    message: error.message,
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    code: 1
                });
            }
        },
        updateAttribute: async (req, res) => {
            try {
                const attribute = await attributeService.updateAttribute(req.params.id, req.body);
                return res.json({
                    message: 'Attribute updated successfully',
                    requestId: (0, uuid_1.v4)(),
                    data: attribute,
                    code: 0
                });
            }
            catch (error) {
                if (error.code === '23505') {
                    return res.status(409).json({
                        message: 'Attribute name must be unique',
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        code: 1
                    });
                }
                return res.status(500).json({
                    message: error.message,
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    code: 1
                });
            }
        },
        deleteAttribute: async (req, res) => {
            try {
                await attributeService.deleteAttribute(req.params.id);
                return res.json({
                    message: 'Attribute deleted successfully',
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    code: 0
                });
            }
            catch (error) {
                if (error.code === '23505') {
                    return res.status(409).json({
                        message: 'Attribute name must be unique',
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        code: 1
                    });
                }
                return res.status(500).json({
                    message: error.message,
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    code: 1
                });
            }
        },
        getAttributeValueById: async (req, res) => {
            try {
                const value = await attributeService.getAttributeValueById(req.params.valueId);
                if (!value || value.attribute.id !== req.params.id) {
                    return res.status(404).json({
                        message: 'Attribute value not found',
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        code: 1
                    });
                }
                return res.json({
                    message: 'Attribute value retrieved successfully',
                    requestId: (0, uuid_1.v4)(),
                    data: value,
                    code: 0
                });
            }
            catch (error) {
                if (error.code === '23505') {
                    return res.status(409).json({
                        message: 'Attribute value must be unique for this attribute',
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        code: 1
                    });
                }
                return res.status(500).json({
                    message: error.message,
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    code: 1
                });
            }
        },
        createAttributeValue: async (req, res) => {
            try {
                const value = await attributeService.createAttributeValue(req.params.id, req.body);
                return res.status(201).json({
                    message: 'Attribute value created successfully',
                    requestId: (0, uuid_1.v4)(),
                    data: value,
                    code: 0
                });
            }
            catch (error) {
                if (error.code === '23505') {
                    return res.status(409).json({
                        message: 'Attribute value must be unique for this attribute',
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        code: 1
                    });
                }
                return res.status(500).json({
                    message: error.message,
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    code: 1
                });
            }
        },
        updateAttributeValue: async (req, res) => {
            try {
                const value = await attributeService.updateAttributeValue(req.params.valueId, req.body);
                return res.json({
                    message: 'Attribute value updated successfully',
                    requestId: (0, uuid_1.v4)(),
                    data: value,
                    code: 0
                });
            }
            catch (error) {
                if (error.code === '23505') {
                    return res.status(409).json({
                        message: 'Attribute value must be unique for this attribute',
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        code: 1
                    });
                }
                return res.status(500).json({
                    message: error.message,
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    code: 1
                });
            }
        },
        deleteAttributeValue: async (req, res) => {
            try {
                await attributeService.deleteAttributeValue(req.params.valueId);
                return res.json({
                    message: 'Attribute value deleted successfully',
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    code: 0
                });
            }
            catch (error) {
                if (error.code === '23505') {
                    return res.status(409).json({
                        message: 'Attribute value must be unique for this attribute',
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        code: 1
                    });
                }
                return res.status(500).json({
                    message: error.message,
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    code: 1
                });
            }
        }
    };
}
