import { Router } from 'express';
import { ShippingMethod } from './shipping-method.entity';
import { shippingMethodController } from './shipping-method.controller';
import { authenticate } from '../auth/middlewares/auth.middleware';
import { validateDto } from '../../common/middlewares/validation.middleware';
import { CreateShippingMethodDto } from './dto/create-shipping-method.dto';
import { UpdateShippingMethodDto } from './dto/update-shipping-method.dto';
import { RequirePermissions } from '../permissions/decorators/require-permissions.decorator';
import { PERMISSION_TYPE } from '../permissions/entities/permission.entity';
import { AppDataSource } from '../../config/database';

const router = Router();
const shippingMethodRepository = AppDataSource.getRepository(ShippingMethod);

const {
  createMethod,
  getMethods,
  getMethod,
  getMethodBySlug,
  updateMethod,
  deleteMethod,
  getMethodsByZone,
  getActiveMethods,
  setDefaultMethod,
  getDefaultMethod,
} = shippingMethodController(shippingMethodRepository);

// Public endpoints for viewing shipping methods (no authentication required)
router.get('/all', getMethods);
router.get('/active', getActiveMethods);
router.get('/default', getDefaultMethod);
router.get('/slug/:slug', getMethodBySlug);
router.get('/:id', getMethod);

// Admin protected routes (require authentication and permissions)
router.post(
  '/store',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_SHIPPING),
  validateDto(CreateShippingMethodDto),
  createMethod
);

router.get(
  '/admin/all',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_SHIPPING),
  getMethods
);

router.get(
  '/admin/active',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_SHIPPING),
  getActiveMethods
);

router.get(
  '/admin/default',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_SHIPPING),
  getDefaultMethod
);

router.get(
  '/admin/:id',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_SHIPPING),
  getMethod
);

router.get(
  '/zone/:zoneId',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_SHIPPING),
  getMethodsByZone
);

router.put(
  '/update/:id',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_SHIPPING),
  validateDto(UpdateShippingMethodDto),
  updateMethod
);

router.put(
  '/:id/set-default',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_SHIPPING),
  setDefaultMethod
);

router.delete(
  '/:id',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_SHIPPING),
  deleteMethod
);

export default router; 