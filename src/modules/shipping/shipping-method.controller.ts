import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { ShippingMethod } from './shipping-method.entity';
import { ShippingMethodService } from './shipping-method.service';
import { cuid } from '../../libs/cuid';

export function shippingMethodController(shippingMethodRepository: Repository<ShippingMethod>) {
  const shippingMethodService = new ShippingMethodService(shippingMethodRepository);

  return {
    createMethod: async (req: Request, res: Response) => {
      try {
        const methodData = req.body;
        const userId = (req as any).user?.id;

        const method = await shippingMethodService.create(methodData, userId);
        res.status(201).json({
          message: 'Shipping method created successfully',
          requestId: cuid(),
          data: method,
          code: 0,
        });
      } catch (error: unknown) {
        res.status(400).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1,
        });
      }
    },

    getMethods: async (req: Request, res: Response) => {
      try {
        const { page, limit, search, zoneId, methodType, isActive } = req.query;
        const methods = await shippingMethodService.findAll(
          Number(page) || 1,
          Number(limit) || 10,
          search as string,
          // zoneId as string,
          methodType as string,
          // isActive === 'true'
        );
        res.json({
          message: 'Shipping methods retrieved successfully',
          requestId: cuid(),
          data: methods,
          code: 0,
        });
      } catch (error: unknown) {
        res.status(500).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1,
        });
      }
    },

    getMethod: async (req: Request, res: Response) => {
      try {
        const method = await shippingMethodService.findOne(req.params.id);
        res.json({
          message: 'Shipping method retrieved successfully',
          requestId: cuid(),
          data: method,
          code: 0,
        });
      } catch (error: unknown) {
        res.status(404).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1,
        });
      }
    },

    getMethodBySlug: async (req: Request, res: Response) => {
      try {
        const method = await shippingMethodService.findBySlug(req.params.slug);
        res.json({
          message: 'Shipping method retrieved successfully',
          requestId: cuid(),
          data: method,
          code: 0,
        });
      } catch (error: unknown) {
        res.status(404).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1,
        });
      }
    },

    updateMethod: async (req: Request, res: Response) => {
      try {
        const userId = (req as any).user?.id;
        const method = await shippingMethodService.update(req.params.id, req.body, userId);
        res.json({
          message: 'Shipping method updated successfully',
          requestId: cuid(),
          data: method,
          code: 0,
        });
      } catch (error: unknown) {
        res.status(400).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1,
        });
      }
    },

    deleteMethod: async (req: Request, res: Response) => {
      try {
        await shippingMethodService.remove(req.params.id);
        res.status(200).json({
          message: 'Shipping method deleted successfully',
          requestId: cuid(),
          data: null,
          code: 0,
        });
      } catch (error: unknown) {
        res.status(404).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1,
        });
      }
    },

    getMethodsByZone: async (req: Request, res: Response) => {
      try {
        const methods = await shippingMethodService.findByZone(req.params.zoneId);
        res.json({
          message: 'Shipping methods for zone retrieved successfully',
          requestId: cuid(),
          data: methods,
          code: 0,
        });
      } catch (error: unknown) {
        res.status(404).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1,
        });
      }
    },

    getActiveMethods: async (req: Request, res: Response) => {
      try {
        const methods = await shippingMethodService.getActiveMethods();
        res.json({
          message: 'Active shipping methods retrieved successfully',
          requestId: cuid(),
          data: methods,
          code: 0,
        });
      } catch (error: unknown) {
        res.status(500).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1,
        });
      }
    },

    setDefaultMethod: async (req: Request, res: Response) => {
      try {
        await shippingMethodService.setDefaultMethod(req.params.id);
        res.json({
          message: 'Default shipping method set successfully',
          requestId: cuid(),
          data: null,
          code: 0,
        });
      } catch (error: unknown) {
        res.status(400).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1,
        });
      }
    },

    getDefaultMethod: async (req: Request, res: Response) => {
      try {
        const method = await shippingMethodService.getDefaultMethod();
        res.json({
          message: method ? 'Default shipping method retrieved successfully' : 'No default method found',
          requestId: cuid(),
          data: method,
          code: 0,
        });
      } catch (error: unknown) {
        res.status(500).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1,
        });
      }
    },
  };
} 