import { Router } from 'express';
import { ShippingZone } from './shipping-zone.entity';
import { shippingZoneController } from './shipping-zone.controller';
import { authenticate } from '../auth/middlewares/auth.middleware';
import { validateDto } from '../../common/middlewares/validation.middleware';
import { CreateShippingZoneDto } from './dto/create-shipping-zone.dto';
import { UpdateShippingZoneDto } from './dto/update-shipping-zone.dto';
import { RequirePermissions } from '../permissions/decorators/require-permissions.decorator';
import { PERMISSION_TYPE } from '../permissions/entities/permission.entity';
import { AppDataSource } from '../../config/database';

const router = Router();
const shippingZoneRepository = AppDataSource.getRepository(ShippingZone);

const {
  createZone,
  getZones,
  getZone,
  getZoneBySlug,
  updateZone,
  deleteZone,
  getActiveZones,
  findMatchingZone,
} = shippingZoneController(shippingZoneRepository);

// Admin protected routes
router.post(
  '/store',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_SHIPPING),
  validateDto(CreateShippingZoneDto),
  createZone
);

// Public endpoints for viewing shipping zones
router.get('/all', getZones);
router.get('/active', getActiveZones);

// Admin protected routes
router.get(
  '/admin/all',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_SHIPPING),
  getZones
);

router.get(
  '/admin/active',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_SHIPPING),
  getActiveZones
);

router.get(
  '/match',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_SHIPPING),
  findMatchingZone
);

router.get(
  '/:id',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_SHIPPING),
  getZone
);

router.get('/slug/:slug', getZoneBySlug);

router.put(
  '/update/:id',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_SHIPPING),
  validateDto(UpdateShippingZoneDto),
  updateZone
);

router.delete(
  '/:id',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_SHIPPING),
  deleteZone
);

export default router; 