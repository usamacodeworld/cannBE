"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const attribute_controller_1 = require("./attribute.controller");
const validation_middleware_1 = require("../../common/middlewares/validation.middleware");
const create_attribute_dto_1 = require("./dto/create-attribute.dto");
const update_attribute_dto_1 = require("./dto/update-attribute.dto");
const create_attribute_value_dto_1 = require("./dto/create-attribute-value.dto");
const update_attribute_value_dto_1 = require("./dto/update-attribute-value.dto");
const get_attributes_query_dto_1 = require("./dto/get-attributes-query.dto");
const database_1 = require("../../config/database");
const attribute_entity_1 = require("./entities/attribute.entity");
const attribute_value_entity_1 = require("./entities/attribute-value.entity");
// Helper to wrap async route handlers
function catchAsync(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
const router = (0, express_1.Router)();
const attributeRepository = database_1.AppDataSource.getRepository(attribute_entity_1.Attribute);
const attributeValueRepository = database_1.AppDataSource.getRepository(attribute_value_entity_1.AttributeValue);
const ctrl = (0, attribute_controller_1.attributeController)(attributeRepository, attributeValueRepository);
// Attribute CRUD
router.get('/', (0, validation_middleware_1.validateDto)(get_attributes_query_dto_1.GetAttributesQueryDto, 'query'), catchAsync(ctrl.getAllAttributes));
router.get('/:id', catchAsync(ctrl.getAttributeById));
router.post('/', (0, validation_middleware_1.validateDto)(create_attribute_dto_1.CreateAttributeDto), catchAsync(ctrl.createAttribute));
router.put('/:id', (0, validation_middleware_1.validateDto)(update_attribute_dto_1.UpdateAttributeDto), catchAsync(ctrl.updateAttribute));
router.delete('/:id', catchAsync(ctrl.deleteAttribute));
// Attribute Value CRUD
router.get('/:id/values', (0, validation_middleware_1.validateDto)(get_attributes_query_dto_1.GetAttributesQueryDto, 'query'), catchAsync(ctrl.getAttributeValues));
router.get('/:id/values/:valueId', catchAsync(ctrl.getAttributeValueById));
router.post('/:id/values', (0, validation_middleware_1.validateDto)(create_attribute_value_dto_1.CreateAttributeValueDto), catchAsync(ctrl.createAttributeValue));
router.put('/:id/values/:valueId', (0, validation_middleware_1.validateDto)(update_attribute_value_dto_1.UpdateAttributeValueDto), catchAsync(ctrl.updateAttributeValue));
router.delete('/:id/values/:valueId', catchAsync(ctrl.deleteAttributeValue));
exports.default = router;
