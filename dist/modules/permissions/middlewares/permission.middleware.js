"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermissions = void 0;
const getResponseAPI_1 = require("../../../common/getResponseAPI");
const responseCode_1 = require("../../../constants/responseCode");
const requirePermissions = (requiredPermissions) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            res.status(401).json((0, getResponseAPI_1.getResponseAPI)(responseCode_1.RES_CODE[401], { message: 'Authentication required' }));
            return;
        }
        if (!user.roles) {
            res.status(403).json((0, getResponseAPI_1.getResponseAPI)(responseCode_1.RES_CODE[403], { message: 'No roles assigned' }));
            return;
        }
        const userPermissions = new Set();
        // Collect all permissions from user's roles
        user.roles.forEach(role => {
            if (role.permissions) {
                role.permissions.forEach(permission => {
                    userPermissions.add(permission.name);
                });
            }
        });
        // Check if user has all required permissions
        const hasAllPermissions = requiredPermissions.every(permission => userPermissions.has(permission));
        if (!hasAllPermissions) {
            res.status(403).json((0, getResponseAPI_1.getResponseAPI)(responseCode_1.RES_CODE[403], {
                message: 'Insufficient permissions',
                requiredPermissions
            }));
            return;
        }
        next();
    };
};
exports.requirePermissions = requirePermissions;
