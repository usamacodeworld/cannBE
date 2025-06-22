"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesGuard = void 0;
const RolesGuard = (requiredRoles) => {
    return (req, res, next) => {
        if (!requiredRoles || requiredRoles.length === 0) {
            return next();
        }
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const hasRole = user.roles?.some((role) => requiredRoles.includes(role.name));
        if (!hasRole) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }
        next();
    };
};
exports.RolesGuard = RolesGuard;
