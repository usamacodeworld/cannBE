import { Router } from 'express';
import { login } from '../controllers/auth.controller';
import { validateDto } from '../../../common/middlewares/validation.middleware';
import { LoginDto } from '../dto/login.dto';

const router = Router();

router.post('/login', validateDto(LoginDto), login);

export default router; 