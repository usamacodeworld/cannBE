import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

export const AuthModule = {
    providers: [JwtAuthGuard, RolesGuard],
    exports: [JwtAuthGuard, RolesGuard]
}; 