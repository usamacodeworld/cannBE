import { Router } from "express";
import { register, getProfile } from "../controllers/user.controller";
import { authenticate } from "../../auth/middlewares/auth.middleware";
import { validateDto } from "../../../common/middlewares/validation.middleware";
import { CreateUserDto } from "../dto/create-user.dto";

const router = Router();

// Public routes
router.post("/register", validateDto(CreateUserDto), register);

// Protected routes
router.get("/profile", authenticate, getProfile);

export default router;
