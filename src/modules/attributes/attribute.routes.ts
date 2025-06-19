import { Router } from 'express';
import { attributeController } from './attribute.controller';
import { validateDto } from '../../common/middlewares/validation.middleware';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { CreateAttributeValueDto } from './dto/create-attribute-value.dto';
import { UpdateAttributeValueDto } from './dto/update-attribute-value.dto';
import { GetAttributesQueryDto } from './dto/get-attributes-query.dto';
import { AppDataSource } from '../../config/database';
import { Attribute } from './entities/attribute.entity';
import { AttributeValue } from './entities/attribute-value.entity';

// Helper to wrap async route handlers
function catchAsync(fn: any) {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

const router = Router();
const attributeRepository = AppDataSource.getRepository(Attribute);
const attributeValueRepository = AppDataSource.getRepository(AttributeValue);
const ctrl = attributeController(attributeRepository, attributeValueRepository);

// Attribute CRUD
router.get('/', validateDto(GetAttributesQueryDto, 'query'), catchAsync(ctrl.getAllAttributes));
router.get('/:id', catchAsync(ctrl.getAttributeById));
router.post('/', validateDto(CreateAttributeDto), catchAsync(ctrl.createAttribute));
router.put('/:id', validateDto(UpdateAttributeDto), catchAsync(ctrl.updateAttribute));
router.delete('/:id', catchAsync(ctrl.deleteAttribute));

// Attribute Value CRUD
router.get('/:id/values', validateDto(GetAttributesQueryDto, 'query'), catchAsync(ctrl.getAttributeValues));
router.get('/:id/values/:valueId', catchAsync(ctrl.getAttributeValueById));
router.post('/:id/values', validateDto(CreateAttributeValueDto), catchAsync(ctrl.createAttributeValue));
router.put('/:id/values/:valueId', validateDto(UpdateAttributeValueDto), catchAsync(ctrl.updateAttributeValue));
router.delete('/:id/values/:valueId', catchAsync(ctrl.deleteAttributeValue));

export default router;