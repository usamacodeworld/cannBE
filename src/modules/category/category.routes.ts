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
import { globalFormDataBoolean } from "../../common/middlewares/global-formdata-boolean";

const router = Router();
const categoryRepository = AppDataSource.getRepository(Category);

const {
  createCategory,
  getCategories,
  getCategory,
  getCategoriesUnrestricted,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
  getParentCategories,
  getSubCategories,
} = categoryController(categoryRepository);

// Admin protected routes
router.post(
  "/store",
  authenticate,
  RequirePermissions(PERMISSION_TYPE.CREATE_CATEGORY),
  // globalFormDataBoolean,
  validateDto(CreateCategoryDto),
  createCategory
);

router.get(
  "/all",
  authenticate,
  RequirePermissions(PERMISSION_TYPE.READ_CATEGORY),
  getCategories
);

router.get("/all/unrestricted", getCategoriesUnrestricted);

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

router.get("/slug/:slug", getCategoryBySlug);

router.put(
  "/update/:id",
  authenticate,
  RequirePermissions(PERMISSION_TYPE.UPDATE_CATEGORY),
  globalFormDataBoolean,
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
