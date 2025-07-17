import { Request, Response } from "express";
import { Repository } from "typeorm";
import { Attribute } from "./entities/attribute.entity";
import { AttributeValue } from "./entities/attribute-value.entity";
import { AttributeService } from "./attribute.service";

import { GetAttributesQueryDto } from "./dto/get-attributes-query.dto";
import { cuid } from "../../libs/cuid";

export function attributeController(
  attributeRepository: Repository<Attribute>,
  attributeValueRepository: Repository<AttributeValue>
) {
  const attributeService = new AttributeService(
    attributeRepository,
    attributeValueRepository
  );

  return {
    getAllAttributes: async (req: Request, res: Response) => {
      try {
        const query = req.validatedQuery || req.query as unknown as GetAttributesQueryDto;
        const result = await attributeService.getAllAttributes(query);
        res.json({
          message: "Attributes retrieved successfully",
          requestId: cuid(),
          data: {
            data: result.data,
            meta: result.meta,
          },
          code: 0,
        });
      } catch (error: any) {
        if (error.code === "23505") {
          return res.status(409).json({
            message: "Attribute name must be unique",
            requestId: cuid(),
            data: null,
            code: 1,
          });
        }
        return res.status(500).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1,
        });
      }
    },
    getAttributeValues: async (req: Request, res: Response) => {
      try {
        const attributeId = req.params.id;
        const query = req.validatedQuery || req.query as unknown as GetAttributesQueryDto;
        const result = await attributeService.getAttributeValues(
          attributeId,
          query
        );
        res.json({
          message: "Attribute values retrieved successfully",
          requestId: cuid(),
          data: {
            data: result.data,
            meta: result.meta,
          },
          code: 0,
        });
      } catch (error: any) {
        if (error.code === "23505") {
          return res.status(409).json({
            message: "Attribute name must be unique",
            requestId: cuid(),
            data: null,
            code: 1,
          });
        }
        return res.status(500).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1,
        });
      }
    },
    getAttributeById: async (req: Request, res: Response) => {
      try {
        const attribute = await attributeService.getAttributeById(
          req.params.id
        );
        if (!attribute) {
          return res.status(404).json({
            message: "Attribute not found",
            requestId: cuid(),
            data: null,
            code: 1,
          });
        }
        return res.json({
          message: "Attribute retrieved successfully",
          requestId: cuid(),
          data: attribute,
          code: 0,
        });
      } catch (error: any) {
        if (error.code === "23505") {
          return res.status(409).json({
            message: "Attribute name must be unique",
            requestId: cuid(),
            data: null,
            code: 1,
          });
        }
        return res.status(500).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1,
        });
      }
    },
    createAttribute: async (req: Request, res: Response) => {
      try {
        const attribute = await attributeService.createAttribute(req.body);
        return res.status(201).json({
          message: "Attribute created successfully",
          requestId: cuid(),
          data: attribute,
          code: 0,
        });
      } catch (error: any) {
        if (error.code === "23505") {
          return res.status(409).json({
            message: "Attribute name must be unique",
            requestId: cuid(),
            data: null,
            code: 1,
          });
        }
        return res.status(500).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1,
        });
      }
    },
    updateAttribute: async (req: Request, res: Response) => {
      try {
        const attribute = await attributeService.updateAttribute(
          req.params.id,
          req.body
        );
        return res.json({
          message: "Attribute updated successfully",
          requestId: cuid(),
          data: attribute,
          code: 0,
        });
      } catch (error: any) {
        if (error.code === "23505") {
          return res.status(409).json({
            message: "Attribute name must be unique",
            requestId: cuid(),
            data: null,
            code: 1,
          });
        }
        return res.status(500).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1,
        });
      }
    },
    deleteAttribute: async (req: Request, res: Response) => {
      try {
        await attributeService.deleteAttribute(req.params.id);
        return res.json({
          message: "Attribute deleted successfully",
          requestId: cuid(),
          data: null,
          code: 0,
        });
      } catch (error: any) {
        if (error.code === "23505") {
          return res.status(409).json({
            message: "Attribute name must be unique",
            requestId: cuid(),
            data: null,
            code: 1,
          });
        }
        return res.status(500).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1,
        });
      }
    },
    getAttributeValueById: async (req: Request, res: Response) => {
      try {
        const value = await attributeService.getAttributeValueById(
          req.params.valueId
        );
        if (!value || value.attribute.id !== req.params.id) {
          return res.status(404).json({
            message: "Attribute value not found",
            requestId: cuid(),
            data: null,
            code: 1,
          });
        }
        return res.json({
          message: "Attribute value retrieved successfully",
          requestId: cuid(),
          data: value,
          code: 0,
        });
      } catch (error: any) {
        if (error.code === "23505") {
          return res.status(409).json({
            message: "Attribute value must be unique for this attribute",
            requestId: cuid(),
            data: null,
            code: 1,
          });
        }
        return res.status(500).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1,
        });
      }
    },
    createAttributeValue: async (req: Request, res: Response) => {
      try {
        const value = await attributeService.createAttributeValue(
          req.params.id,
          req.body
        );
        return res.status(201).json({
          message: "Attribute value created successfully",
          requestId: cuid(),
          data: value,
          code: 0,
        });
      } catch (error: any) {
        if (error.code === "23505") {
          return res.status(409).json({
            message: "Attribute value must be unique for this attribute",
            requestId: cuid(),
            data: null,
            code: 1,
          });
        }
        return res.status(500).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1,
        });
      }
    },
    updateAttributeValue: async (req: Request, res: Response) => {
      try {
        const value = await attributeService.updateAttributeValue(
          req.params.valueId,
          req.body
        );
        return res.json({
          message: "Attribute value updated successfully",
          requestId: cuid(),
          data: value,
          code: 0,
        });
      } catch (error: any) {
        if (error.code === "23505") {
          return res.status(409).json({
            message: "Attribute value must be unique for this attribute",
            requestId: cuid(),
            data: null,
            code: 1,
          });
        }
        return res.status(500).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1,
        });
      }
    },
    deleteAttributeValue: async (req: Request, res: Response) => {
      try {
        await attributeService.deleteAttributeValue(req.params.valueId);
        return res.json({
          message: "Attribute value deleted successfully",
          requestId: cuid(),
          data: null,
          code: 0,
        });
      } catch (error: any) {
        if (error.code === "23505") {
          return res.status(409).json({
            message: "Attribute value must be unique for this attribute",
            requestId: cuid(),
            data: null,
            code: 1,
          });
        }
        return res.status(500).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1,
        });
      }
    },
  };
}
