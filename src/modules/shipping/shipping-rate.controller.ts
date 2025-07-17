import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { ShippingRate } from './shipping-rate.entity';
import { ShippingRateService } from './shipping-rate.service';
import { cuid } from '../../libs/cuid';

export function shippingRateController(shippingRateRepository: Repository<ShippingRate>) {
  const shippingRateService = new ShippingRateService(shippingRateRepository);

  return {
    createRate: async (req: Request, res: Response) => {
      try {
        const rateData = req.body;
        const userId = (req as any).user?.id;

        const rate = await shippingRateService.create(rateData, userId);
        res.status(201).json({
          message: 'Shipping rate created successfully',
          requestId: cuid(),
          data: rate,
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

    getRates: async (req: Request, res: Response) => {
      try {
        const { page, limit, search, methodId, rateType, isActive } = req.query;
        const rates = await shippingRateService.findAll(
          Number(page) || 1,
          Number(limit) || 10,
          search as string,
          // methodId as string,
          // rateType as string,
          // isActive === 'true'
        );
        res.json({
          message: 'Shipping rates retrieved successfully',
          requestId: cuid(),
          data: rates,
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

    getRate: async (req: Request, res: Response) => {
      try {
        const rate = await shippingRateService.findOne(req.params.id);
        res.json({
          message: 'Shipping rate retrieved successfully',
          requestId: cuid(),
          data: rate,
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

    updateRate: async (req: Request, res: Response) => {
      try {
        const userId = (req as any).user?.id;
        const rate = await shippingRateService.update(req.params.id, req.body, userId);
        res.json({
          message: 'Shipping rate updated successfully',
          requestId: cuid(),
          data: rate,
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

    deleteRate: async (req: Request, res: Response) => {
      try {
        await shippingRateService.remove(req.params.id);
        res.status(200).json({
          message: 'Shipping rate deleted successfully',
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

    getRatesByMethod: async (req: Request, res: Response) => {
      try {
        const rates = await shippingRateService.findByMethod(req.params.methodId);
        res.json({
          message: 'Shipping rates for method retrieved successfully',
          requestId: cuid(),
          data: rates,
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

    calculateShippingCost: async (req: Request, res: Response) => {
      try {
        const {
          methodId,
          weight,
          orderValue,
          distance,
          itemCount,
          productIds,
          categoryIds,
          isHoliday,
        } = req.body;

        if (!methodId) {
          res.status(400).json({
            message: 'Method ID is required',
            requestId: cuid(),
            data: null,
            code: 1,
          });
          return;
        }

        const result = await shippingRateService.calculateShippingCost({
          methodId,
          weight: weight ? Number(weight) : undefined,
          orderValue: orderValue ? Number(orderValue) : undefined,
          distance: distance ? Number(distance) : undefined,
          itemCount: itemCount ? Number(itemCount) : undefined,
          productIds: productIds ? (Array.isArray(productIds) ? productIds : [productIds]) : undefined,
          categoryIds: categoryIds ? (Array.isArray(categoryIds) ? categoryIds : [categoryIds]) : undefined,
          isHoliday: isHoliday === true,
        });

        res.json({
          message: result ? 'Shipping cost calculated successfully' : 'No applicable shipping rate found',
          requestId: cuid(),
          data: result,
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

    calculateMultipleMethods: async (req: Request, res: Response) => {
      try {
        const {
          methodIds,
          weight,
          orderValue,
          distance,
          itemCount,
          productIds,
          categoryIds,
          isHoliday,
        } = req.body;

        if (!methodIds || !Array.isArray(methodIds)) {
          res.status(400).json({
            message: 'Method IDs array is required',
            requestId: cuid(),
            data: null,
            code: 1,
          });
          return;
        }

        const results = [];

        for (const methodId of methodIds) {
          const result = await shippingRateService.calculateShippingCost({
            methodId,
            weight: weight ? Number(weight) : undefined,
            orderValue: orderValue ? Number(orderValue) : undefined,
            distance: distance ? Number(distance) : undefined,
            itemCount: itemCount ? Number(itemCount) : undefined,
            productIds: productIds ? (Array.isArray(productIds) ? productIds : [productIds]) : undefined,
            categoryIds: categoryIds ? (Array.isArray(categoryIds) ? categoryIds : [categoryIds]) : undefined,
            isHoliday: isHoliday === true,
          });

          if (result) {
            results.push({
              methodId,
              ...result,
            });
          }
        }

        res.json({
          message: 'Shipping costs calculated successfully',
          requestId: cuid(),
          data: results,
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