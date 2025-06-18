import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { Attribute } from './entities/attribute.entity';
import { AttributeValue } from './entities/attribute-value.entity';
import { AttributeService } from './attribute.service';
import { v4 as uuidv4 } from 'uuid';

export function attributeController(
  attributeRepository: Repository<Attribute>,
  attributeValueRepository: Repository<AttributeValue>
) {
  const attributeService = new AttributeService(attributeRepository, attributeValueRepository);

  return {
    getAllAttributes: async (req: Request, res: Response) => {
      try {
        const attributes = await attributeService.getAllAttributes();
        res.json({
          message: 'Attributes retrieved successfully',
          requestId: uuidv4(),
          data: attributes,
          code: 0
        });
      } catch (error: unknown) {
        res.status(500).json({
          message: (error as Error).message,
          requestId: uuidv4(),
          data: null,
          code: 1
        });
      }
    },
    getAttributeValues: async (req: Request, res: Response) => {
      try {
        const attributeId = req.params.id;
        const values = await attributeService.getAttributeValues(attributeId);
        res.json({
          message: 'Attribute values retrieved successfully',
          requestId: uuidv4(),
          data: values,
          code: 0
        });
      } catch (error: unknown) {
        res.status(500).json({
          message: (error as Error).message,
          requestId: uuidv4(),
          data: null,
          code: 1
        });
      }
    }
  };
} 