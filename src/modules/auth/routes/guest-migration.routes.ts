import { Router } from "express";
import { GuestMigrationController } from "../controllers/guest-migration.controller";
import { validateDto } from "../../../common/middlewares/validation.middleware";
import { CreateUserDto } from "../../user/dto/create-user.dto";

const router = Router();
const guestMigrationController = new GuestMigrationController();

// Check guest data before migration
router.get("/check/:guestId", (req, res) => guestMigrationController.checkGuestData(req, res));

// Register and migrate guest data
router.post("/register", validateDto(CreateUserDto), (req, res) => guestMigrationController.registerAndMigrate(req, res));

export default router; 