import { Router } from "express";
import { Category } from "./category.entity";
import { categoryController } from "./category.controller";
import { authenticate } from "../auth/middlewares/auth.middleware";
import { validateDto } from "../../common/middlewares/validation.middleware";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { RequirePermissions } from "../permissions/decorators/require-permissions.decorator";
import { PERMISSION_TYPE } from "../permissions/entities/permission.entity";
import { AppDataSource } from "../../config/database";

const router = Router();
const categoryRepository = AppDataSource.getRepository(Category);
const {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  getParentCategories,
  getSubCategories
} = categoryController(categoryRepository);

// Admin protected routes
router.post(
  "/store",
  authenticate,
  RequirePermissions(PERMISSION_TYPE.CREATE_CATEGORY),
  validateDto(CreateCategoryDto),
  createCategory
);

router.get(
  "/",
  authenticate,
  RequirePermissions(PERMISSION_TYPE.READ_CATEGORY),
  getCategories
);

router.get(
  "/parents",
  authenticate,
  RequirePermissions(PERMISSION_TYPE.READ_CATEGORY),
  getParentCategories
);

router.get(
  "/:id",
  authenticate,
  RequirePermissions(PERMISSION_TYPE.READ_CATEGORY),
  getCategory
);

router.get(
  "/:id/subcategories",
  authenticate,
  RequirePermissions(PERMISSION_TYPE.READ_CATEGORY),
  getSubCategories
);

router.patch(
  "/update/:id",
  authenticate,
  RequirePermissions(PERMISSION_TYPE.UPDATE_CATEGORY),
  validateDto(UpdateCategoryDto),
  updateCategory
);

router.delete(
  "/:id",
  authenticate,
  RequirePermissions(PERMISSION_TYPE.DELETE_CATEGORY),
  deleteCategory
);

export default router; 