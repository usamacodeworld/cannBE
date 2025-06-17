import { PERMISSION_TYPE } from '../entities/permission.entity';
import { requirePermissions } from '../middlewares/permission.middleware';

export const RequirePermissions = (...permissions: PERMISSION_TYPE[]) => {
  return requirePermissions(permissions);
}; 