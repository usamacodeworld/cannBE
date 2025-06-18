import { Router } from 'express';
import { Attribute } from './entities/attribute.entity';
import { AttributeValue } from './entities/attribute-value.entity';
import { attributeController } from './attribute.controller';
import { AppDataSource } from '../../config/database';

const router = Router();
const attributeRepository = AppDataSource.getRepository(Attribute);
const attributeValueRepository = AppDataSource.getRepository(AttributeValue);
const { getAllAttributes, getAttributeValues } = attributeController(attributeRepository, attributeValueRepository);

router.get('/', getAllAttributes);
router.get('/:id/values', getAttributeValues);

export default router; 