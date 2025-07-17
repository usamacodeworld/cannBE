import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { ShippingZone } from './shipping-zone.entity';
import { ShippingZoneService } from './shipping-zone.service';
import { GetShippingZonesQueryDto } from './dto/get-shipping-zones-query.dto';
import { cuid } from '../../libs/cuid';

export function shippingZoneController(shippingZoneRepository: Repository<ShippingZone>) {
  const shippingZoneService = new ShippingZoneService(shippingZoneRepository);

  return {
    createZone: async (req: Request, res: Response) => {
      try {
        const zoneData = req.body;
        const userId = (req as any).user?.id;

        const zone = await shippingZoneService.create(zoneData, userId);
        res.status(201).json({
          message: 'Shipping zone created successfully',
          requestId: cuid(),
          data: zone,
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

    getZones: async (req: Request, res: Response) => {
      try {
        const query = req.query as unknown as GetShippingZonesQueryDto;
        const zones = await shippingZoneService.findAll(query);
        res.json({
          message: 'Shipping zones retrieved successfully',
          requestId: cuid(),
          data: zones,
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

    getZone: async (req: Request, res: Response) => {
      try {
        const zone = await shippingZoneService.findOne(req.params.id);
        res.json({
          message: 'Shipping zone retrieved successfully',
          requestId: cuid(),
          data: zone,
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

    getZoneBySlug: async (req: Request, res: Response) => {
      try {
        const zone = await shippingZoneService.findBySlug(req.params.slug);
        res.json({
          message: 'Shipping zone retrieved successfully',
          requestId: cuid(),
          data: zone,
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

    updateZone: async (req: Request, res: Response) => {
      try {
        const userId = (req as any).user?.id;
        const zone = await shippingZoneService.update(req.params.id, req.body, userId);
        res.json({
          message: 'Shipping zone updated successfully',
          requestId: cuid(),
          data: zone,
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

    deleteZone: async (req: Request, res: Response) => {
      try {
        await shippingZoneService.remove(req.params.id);
        res.status(200).json({
          message: 'Shipping zone deleted successfully',
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

    getActiveZones: async (req: Request, res: Response) => {
      try {
        const zones = await shippingZoneService.getActiveZones();
        res.json({
          message: 'Active shipping zones retrieved successfully',
          requestId: cuid(),
          data: zones,
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

    findMatchingZone: async (req: Request, res: Response) => {
      try {
        const { country, state, city, postalCode } = req.query;
        
        if (!country) {
          res.status(400).json({
            message: 'Country is required',
            requestId: cuid(),
            data: null,
            code: 1,
          });
          return;
        }

        const zone = await shippingZoneService.findMatchingZone(
          country as string,
          state as string,
          city as string,
          postalCode as string
        );

        res.json({
          message: zone ? 'Matching zone found' : 'No matching zone found',
          requestId: cuid(),
          data: zone,
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