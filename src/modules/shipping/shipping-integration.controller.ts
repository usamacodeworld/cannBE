import { Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { ShippingIntegrationService, ShippingCalculationRequest } from './shipping-integration.service';
import { ShippingRateService } from './shipping-rate.service';
import { ShippingMethodService } from './shipping-method.service';
import { ShippingRate } from './shipping-rate.entity';
import { ShippingMethod } from './shipping-method.entity';
import { cuid } from '../../libs/cuid';

export function shippingIntegrationController(dataSource: DataSource) {
  const shippingRateService = new ShippingRateService(
    dataSource.getRepository(ShippingRate)
  );
  const shippingMethodService = new ShippingMethodService(
    dataSource.getRepository(ShippingMethod)
  );
  const shippingIntegrationService = new ShippingIntegrationService(
    dataSource,
    shippingRateService,
    shippingMethodService
  );

  return {
    /**
     * Calculate shipping options for checkout
     */
    calculateShippingOptions: async (req: Request, res: Response): Promise<void> => {
      try {
        const { items, shippingAddress, orderValue, isHoliday } = req.body;

        // Validate required fields
        if (!items || !Array.isArray(items) || items.length === 0) {
          res.status(400).json({
            message: 'Items array is required and must not be empty',
            requestId: cuid(),
            data: null,
            code: 1,
          });
          return;
        }

        if (!shippingAddress) {
          res.status(400).json({
            message: 'Shipping address is required',
            requestId: cuid(),
            data: null,
            code: 1,
          });
          return;
        }

        if (!orderValue || orderValue <= 0) {
          res.status(400).json({
            message: 'Valid order value is required',
            requestId: cuid(),
            data: null,
            code: 1,
          });
          return;
        }

        const request: ShippingCalculationRequest = {
          items,
          shippingAddress,
          orderValue,
          isHoliday: isHoliday || false,
        };

        const shippingOptions = await shippingIntegrationService.calculateShippingOptions(request);

        res.json({
          message: 'Shipping options calculated successfully',
          requestId: cuid(),
          data: shippingOptions,
          code: 0,
        });
      } catch (error: unknown) {
        console.error('Error calculating shipping options:', error);
        res.status(500).json({
          message: (error as Error).message || 'Failed to calculate shipping options',
          requestId: cuid(),
          data: null,
          code: 1,
        });
      }
    },

    /**
     * Get shipping cost for a specific method
     */
    getShippingCostForMethod: async (req: Request, res: Response): Promise<void> => {
      try {
        const { methodId } = req.params;
        const { items, shippingAddress, orderValue, isHoliday } = req.body;

        // Validate required fields
        if (!methodId) {
          res.status(400).json({
            message: 'Method ID is required',
            requestId: cuid(),
            data: null,
            code: 1,
          });
          return;
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
          res.status(400).json({
            message: 'Items array is required and must not be empty',
            requestId: cuid(),
            data: null,
            code: 1,
          });
          return;
        }

        if (!shippingAddress) {
          res.status(400).json({
            message: 'Shipping address is required',
            requestId: cuid(),
            data: null,
            code: 1,
          });
          return;
        }

        if (!orderValue || orderValue <= 0) {
          res.status(400).json({
            message: 'Valid order value is required',
            requestId: cuid(),
            data: null,
            code: 1,
          });
          return;
        }

        const request: ShippingCalculationRequest = {
          items,
          shippingAddress,
          orderValue,
          isHoliday: isHoliday || false,
        };

        const shippingCost = await shippingIntegrationService.getShippingCostForMethod(methodId, request);

        if (!shippingCost) {
          res.status(404).json({
            message: 'Shipping method not found or not available for this address',
            requestId: cuid(),
            data: null,
            code: 1,
          });
          return;
        }

        res.json({
          message: 'Shipping cost calculated successfully',
          requestId: cuid(),
          data: shippingCost,
          code: 0,
        });
      } catch (error: unknown) {
        console.error('Error getting shipping cost for method:', error);
        res.status(500).json({
          message: (error as Error).message || 'Failed to get shipping cost',
          requestId: cuid(),
          data: null,
          code: 1,
        });
      }
    },

    /**
     * Get default shipping option
     */
    getDefaultShippingOption: async (req: Request, res: Response): Promise<void> => {
      try {
        const { items, shippingAddress, orderValue, isHoliday } = req.body;

        // Validate required fields
        if (!items || !Array.isArray(items) || items.length === 0) {
          res.status(400).json({
            message: 'Items array is required and must not be empty',
            requestId: cuid(),
            data: null,
            code: 1,
          });
          return;
        }

        if (!shippingAddress) {
          res.status(400).json({
            message: 'Shipping address is required',
            requestId: cuid(),
            data: null,
            code: 1,
          });
          return;
        }

        if (!orderValue || orderValue <= 0) {
          res.status(400).json({
            message: 'Valid order value is required',
            requestId: cuid(),
            data: null,
            code: 1,
          });
          return;
        }

        const request: ShippingCalculationRequest = {
          items,
          shippingAddress,
          orderValue,
          isHoliday: isHoliday || false,
        };

        const defaultOption = await shippingIntegrationService.getDefaultShippingOption(request);

        if (!defaultOption) {
          res.status(404).json({
            message: 'No default shipping method found',
            requestId: cuid(),
            data: null,
            code: 1,
          });
          return;
        }

        res.json({
          message: 'Default shipping option retrieved successfully',
          requestId: cuid(),
          data: defaultOption,
          code: 0,
        });
      } catch (error: unknown) {
        console.error('Error getting default shipping option:', error);
        res.status(500).json({
          message: (error as Error).message || 'Failed to get default shipping option',
          requestId: cuid(),
          data: null,
          code: 1,
        });
      }
    },

    /**
     * Validate shipping method for address
     */
    validateShippingMethodForAddress: async (req: Request, res: Response): Promise<void> => {
      try {
        const { methodId } = req.params;
        const { shippingAddress } = req.body;

        if (!methodId) {
          res.status(400).json({
            message: 'Method ID is required',
            requestId: cuid(),
            data: null,
            code: 1,
          });
          return;
        }

        if (!shippingAddress) {
          res.status(400).json({
            message: 'Shipping address is required',
            requestId: cuid(),
            data: null,
            code: 1,
          });
          return;
        }

        const isValid = await shippingIntegrationService.validateShippingMethodForAddress(
          methodId,
          shippingAddress
        );

        res.json({
          message: isValid ? 'Shipping method is valid for this address' : 'Shipping method is not available for this address',
          requestId: cuid(),
          data: { isValid },
          code: 0,
        });
      } catch (error: unknown) {
        console.error('Error validating shipping method for address:', error);
        res.status(500).json({
          message: (error as Error).message || 'Failed to validate shipping method',
          requestId: cuid(),
          data: null,
          code: 1,
        });
      }
    },
  };
} 