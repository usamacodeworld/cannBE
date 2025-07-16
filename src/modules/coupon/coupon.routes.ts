import { Router } from 'express';
import { Coupon } from './coupon.entity';
import { couponController } from './coupon.controller';
import { authenticate } from '../auth/middlewares/auth.middleware';
import { validateDto } from '../../common/middlewares/validation.middleware';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';
import { RequirePermissions } from '../permissions/decorators/require-permissions.decorator';
import { PERMISSION_TYPE } from '../permissions/entities/permission.entity';
import { AppDataSource } from '../../config/database';

const router = Router();
const couponRepository = AppDataSource.getRepository(Coupon);

const {
  createCoupon,
  getCoupons,
  getCoupon,
  getCouponByCode,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  deactivateCoupon,
  activateCoupon,
  getCouponStats,
  bulkCreateCoupons,
  exportCoupons,
  checkCodeAvailability
} = couponController(couponRepository);

// Admin protected routes
router.post(
  '/',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_STORE),
  validateDto(CreateCouponDto),
  createCoupon
);

router.get(
  '/',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_STORE),
  getCoupons
);

router.get(
  '/stats',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_STORE),
  getCouponStats
);

router.get(
  '/export',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_STORE),
  exportCoupons
);

router.post(
  '/bulk',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_STORE),
  bulkCreateCoupons
);

router.get(
  '/check-code/:code',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_STORE),
  checkCodeAvailability
);

router.get(
  '/:id',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_STORE),
  getCoupon
);

router.put(
  '/:id',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_STORE),
  validateDto(UpdateCouponDto),
  updateCoupon
);

router.delete(
  '/:id',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_STORE),
  deleteCoupon
);

router.patch(
  '/:id/deactivate',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_STORE),
  deactivateCoupon
);

router.patch(
  '/:id/activate',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_STORE),
  activateCoupon
);

// Public routes (for validating coupons during checkout)
router.post(
  '/validate',
  validateDto(ValidateCouponDto),
  validateCoupon
);

router.get(
  '/code/:code',
  getCouponByCode
);

export default router; 