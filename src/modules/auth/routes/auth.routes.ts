import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validateDto } from '../../../common/middlewares/validation.middleware';
import { LoginDto } from '../dto/login.dto';

const router = Router();

router.post('/login', validateDto(LoginDto), authController.login);

export default router; 