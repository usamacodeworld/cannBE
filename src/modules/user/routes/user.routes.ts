import { Router } from "express";
import { register, getProfile, getUsers } from "../controllers/user.controller";
import { authenticate } from "../../auth/middlewares/auth.middleware";
import { validateDto } from "../../../common/middlewares/validation.middleware";
import { CreateUserDto } from "../dto/create-user.dto";
import { GetUsersQueryDto } from "../dto/get-users-query.dto";
import { RequirePermissions } from "../../permissions/decorators/require-permissions.decorator";
import { PERMISSION_TYPE } from "../../permissions/entities/permission.entity";

const router = Router();

// Public routes
router.post("/register", validateDto(CreateUserDto), register);

// Protected routes
router.get(
  "/profile",
  authenticate,
  RequirePermissions(PERMISSION_TYPE.READ_USER),
  getProfile
);

router.get(
  "/",
  authenticate,
  RequirePermissions(PERMISSION_TYPE.READ_USER),
  validateDto(GetUsersQueryDto),
  getUsers
);

export default router;
