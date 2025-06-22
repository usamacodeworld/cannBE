import { Request, Response, NextFunction } from 'express';
import { PERMISSION_TYPE } from '../entities/permission.entity';

export const PermissionGuard = (requiredPermissions: PERMISSION_TYPE[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!requiredPermissions || requiredPermissions.length === 0) {
            return next();
        }

        const user = req.user as any;
        if (!user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        if (!user.roles) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }

        const userPermissions = new Set<PERMISSION_TYPE>();
        
        // Collect all permissions from user's roles
        user.roles.forEach((role: any) => {
            if (role.permissions) {
                role.permissions.forEach((permission: any) => {
                    userPermissions.add(permission.name);
                });
            }
        });

        // Check if user has all required permissions
        const hasAllPermissions = requiredPermissions.every(permission => 
            userPermissions.has(permission)
        );

        if (!hasAllPermissions) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }

        next();
    };
}; 