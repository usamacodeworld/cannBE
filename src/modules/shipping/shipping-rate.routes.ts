import { Router } from 'express';
import { ShippingRate } from './shipping-rate.entity';
import { shippingRateController } from './shipping-rate.controller';
import { authenticate } from '../auth/middlewares/auth.middleware';
import { validateDto } from '../../common/middlewares/validation.middleware';
import { CreateShippingRateDto } from './dto/create-shipping-rate.dto';
import { UpdateShippingRateDto } from './dto/update-shipping-rate.dto';
import { RequirePermissions } from '../permissions/decorators/require-permissions.decorator';
import { PERMISSION_TYPE } from '../permissions/entities/permission.entity';
import { AppDataSource } from '../../config/database';

const router = Router();
const shippingRateRepository = AppDataSource.getRepository(ShippingRate);

const {
  createRate,
  getRates,
  getRate,
  updateRate,
  deleteRate,
  getRatesByMethod,
  calculateShippingCost,
  calculateMultipleMethods,
} = shippingRateController(shippingRateRepository);

// Admin protected routes
router.post(
  '/store',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_SHIPPING),
  validateDto(CreateShippingRateDto),
  createRate
);

// Public endpoints for viewing shipping rates
router.get('/all', getRates);
router.get('/method/:methodId', getRatesByMethod);

// Admin protected routes
router.get(
  '/admin/all',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_SHIPPING),
  getRates
);

router.get(
  '/admin/method/:methodId',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_SHIPPING),
  getRatesByMethod
);

router.get(
  '/:id',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_SHIPPING),
  getRate
);

router.put(
  '/update/:id',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_SHIPPING),
  validateDto(UpdateShippingRateDto),
  updateRate
);

router.delete(
  '/:id',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_SHIPPING),
  deleteRate
);

// Public routes for shipping calculations
router.post('/calculate', calculateShippingCost);

router.post('/calculate-multiple', calculateMultipleMethods);

export default router; 