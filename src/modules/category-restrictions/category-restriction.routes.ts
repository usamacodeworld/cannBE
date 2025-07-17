import { Router } from 'express';
import { CategoryStateRestriction } from './category-restriction.entity';
import { categoryRestrictionController } from './category-restriction.controller';
import { authenticate } from '../auth/middlewares/auth.middleware';
import { validateDto } from '../../common/middlewares/validation.middleware';
import { CreateCategoryRestrictionDto } from './dto/create-category-restriction.dto';
import { UpdateCategoryRestrictionDto } from './dto/update-category-restriction.dto';
import { RequirePermissions } from '../permissions/decorators/require-permissions.decorator';
import { PERMISSION_TYPE } from '../permissions/entities/permission.entity';
import { AppDataSource } from '../../config/database';

const router = Router();
const categoryRestrictionRepository = AppDataSource.getRepository(CategoryStateRestriction);

const {
  createRestriction,
  getRestrictions,
  getRestriction,
  updateRestriction,
  deleteRestriction,
  checkRestriction,
  validateProducts,
  getUSStates
} = categoryRestrictionController(categoryRestrictionRepository);

// Admin protected routes
router.post(
  '/',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_STORE),
  validateDto(CreateCategoryRestrictionDto),
  createRestriction
);

router.get(
  '/',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_STORE),
  getRestrictions
);

router.get(
  '/:id',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_STORE),
  getRestriction
);

router.put(
  '/:id',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_STORE),
  validateDto(UpdateCategoryRestrictionDto),
  updateRestriction
);

router.delete(
  '/:id',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_STORE),
  deleteRestriction
);

// Public routes (for checking restrictions)
router.get(
  '/check/:categoryId/:state',
  checkRestriction
);

router.post(
  '/validate/:state',
  validateProducts
);

router.get(
  '/states/us',
  getUSStates
);

export default router; 