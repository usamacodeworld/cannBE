"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionGuard = void 0;
const PermissionGuard = (requiredPermissions) => {
    return (req, res, next) => {
        if (!requiredPermissions || requiredPermissions.length === 0) {
            return next();
        }
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        if (!user.roles) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }
        const userPermissions = new Set();
        // Collect all permissions from user's roles
        user.roles.forEach((role) => {
            if (role.permissions) {
                role.permissions.forEach((permission) => {
                    userPermissions.add(permission.name);
                });
            }
        });
        // Check if user has all required permissions
        const hasAllPermissions = requiredPermissions.every(permission => userPermissions.has(permission));
        if (!hasAllPermissions) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }
        next();
    };
};
exports.PermissionGuard = PermissionGuard;
