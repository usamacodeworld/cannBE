import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { Coupon } from './coupon.entity';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { GetCouponsQueryDto } from './dto/get-coupons-query.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';
import { cuid } from '../../libs/cuid';

export function couponController(couponRepository: Repository<Coupon>) {
  const couponService = new CouponService(couponRepository);

  return {
    // Create a new coupon
    createCoupon: async (req: Request, res: Response) => {
      try {
        const createDto: CreateCouponDto = req.body;
        const userId = (req as any).user?.id;

        if (userId) {
          createDto.createdBy = userId;
        }

        const coupon = await couponService.create(createDto);
        res.status(201).json({
          message: 'Coupon created successfully',
          requestId: cuid(),
          data: coupon,
          code: 0
        });
      } catch (error: unknown) {
        res.status(400).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1
        });
      }
    },

    // Get all coupons
    getCoupons: async (req: Request, res: Response) => {
      try {
        const query = req.query as unknown as GetCouponsQueryDto;
        const coupons = await couponService.findAll(query);
        res.json({
          message: 'Coupons retrieved successfully',
          requestId: cuid(),
          data: coupons,
          code: 0
        });
      } catch (error: unknown) {
        res.status(500).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1
        });
      }
    },

    // Get a specific coupon by ID
    getCoupon: async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const coupon = await couponService.findOne(id);
        res.json({
          message: 'Coupon retrieved successfully',
          requestId: cuid(),
          data: coupon,
          code: 0
        });
      } catch (error: unknown) {
        res.status(404).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1
        });
      }
    },

    // Get a coupon by code
    getCouponByCode: async (req: Request, res: Response) => {
      try {
        const { code } = req.params;
        const coupon = await couponService.findByCode(code);
        
        if (!coupon) {
          res.status(404).json({
            message: 'Coupon not found',
            requestId: cuid(),
            data: null,
            code: 1
          });
        } else {
          res.json({
            message: 'Coupon retrieved successfully',
            requestId: cuid(),
            data: coupon,
            code: 0
          });
        }
      } catch (error: unknown) {
        res.status(500).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1
        });
      }
    },

    // Update a coupon
    updateCoupon: async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const updateDto: UpdateCouponDto = req.body;
        const coupon = await couponService.update(id, updateDto);
        res.json({
          message: 'Coupon updated successfully',
          requestId: cuid(),
          data: coupon,
          code: 0
        });
      } catch (error: unknown) {
        res.status(400).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1
        });
      }
    },

    // Delete a coupon
    deleteCoupon: async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        await couponService.remove(id);
        res.json({
          message: 'Coupon deleted successfully',
          requestId: cuid(),
          data: null,
          code: 0
        });
      } catch (error: unknown) {
        res.status(400).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1
        });
      }
    },

    // Validate a coupon
    validateCoupon: async (req: Request, res: Response) => {
      try {
        const validationDto: ValidateCouponDto = req.body;
        const result = await couponService.validateCoupon(validationDto);
        res.json({
          message: 'Coupon validation completed',
          requestId: cuid(),
          data: result,
          code: 0
        });
      } catch (error: unknown) {
        res.status(500).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1
        });
      }
    },

    // Deactivate a coupon
    deactivateCoupon: async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const coupon = await couponService.deactivateCoupon(id);
        res.json({
          message: 'Coupon deactivated successfully',
          requestId: cuid(),
          data: coupon,
          code: 0
        });
      } catch (error: unknown) {
        res.status(400).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1
        });
      }
    },

    // Activate a coupon
    activateCoupon: async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const coupon = await couponService.activateCoupon(id);
        res.json({
          message: 'Coupon activated successfully',
          requestId: cuid(),
          data: coupon,
          code: 0
        });
      } catch (error: unknown) {
        res.status(400).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1
        });
      }
    },

    // Get coupon usage statistics
    getCouponStats: async (req: Request, res: Response) => {
      try {
        const stats = await couponService.getUsageStats();
        res.json({
          message: 'Coupon statistics retrieved successfully',
          requestId: cuid(),
          data: stats,
          code: 0
        });
      } catch (error: unknown) {
        res.status(500).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1
        });
      }
    },

    // Bulk create coupons (useful for generating many similar coupons)
    bulkCreateCoupons: async (req: Request, res: Response) => {
      try {
        const { baseCode, count, type, value, ...otherData } = req.body;
        const userId = (req as any).user?.id;
        const createdCoupons = [];
        const errors = [];

        for (let i = 1; i <= count; i++) {
          try {
            const couponCode = `${baseCode}${i.toString().padStart(3, '0')}`;
            const createDto: CreateCouponDto = {
              code: couponCode,
              name: `${otherData.name || baseCode} #${i}`,
              type,
              value,
              createdBy: userId,
              ...otherData
            };

            const coupon = await couponService.create(createDto);
            createdCoupons.push(coupon);
          } catch (error) {
            errors.push(`Failed to create coupon ${i}: ${(error as Error).message}`);
          }
        }

        res.status(201).json({
          message: `Bulk coupon creation completed. Created ${createdCoupons.length} of ${count} coupons.`,
          requestId: cuid(),
          data: {
            created: createdCoupons,
            errors: errors.length > 0 ? errors : undefined,
            summary: {
              total: count,
              created: createdCoupons.length,
              failed: errors.length
            }
          },
          code: 0
        });
      } catch (error: unknown) {
        res.status(400).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1
        });
      }
    },

    // Export coupons to CSV (for reporting)
    exportCoupons: async (req: Request, res: Response) => {
      try {
        const query = req.query as unknown as GetCouponsQueryDto;
        query.limit = 1000; // Export limit
        
        const coupons = await couponService.findAll(query);
        
        // Convert to CSV format
        const csvHeaders = [
          'ID', 'Code', 'Name', 'Type', 'Value', 'Minimum Amount', 'Maximum Discount',
          'Start Date', 'End Date', 'Usage Limit', 'Usage Count', 'Is Active', 'Created At'
        ];
        
        const csvRows = coupons.data.map(coupon => [
          coupon.id,
          coupon.code,
          coupon.name,
          coupon.type,
          coupon.value,
          coupon.minimumAmount || '',
          coupon.maximumDiscount || '',
          coupon.startDate || '',
          coupon.endDate || '',
          coupon.usageLimit || '',
          coupon.usageCount,
          coupon.isActive,
          coupon.createdAt
        ]);

        const csvContent = [csvHeaders, ...csvRows]
          .map(row => row.map(field => `"${field}"`).join(','))
          .join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=coupons.csv');
        res.send(csvContent);
      } catch (error: unknown) {
        res.status(500).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1
        });
      }
    },

    // Check if a specific coupon code is available
    checkCodeAvailability: async (req: Request, res: Response) => {
      try {
        const { code } = req.params;
        const existingCoupon = await couponService.findByCode(code);
        
        res.json({
          message: 'Code availability checked',
          requestId: cuid(),
          data: {
            code,
            isAvailable: !existingCoupon,
            exists: !!existingCoupon
          },
          code: 0
        });
      } catch (error: unknown) {
        res.status(500).json({
          message: (error as Error).message,
          requestId: cuid(),
          data: null,
          code: 1
        });
      }
    }
  };
} 