"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequirePermissions = void 0;
const permission_middleware_1 = require("../middlewares/permission.middleware");
const RequirePermissions = (...permissions) => {
    return (0, permission_middleware_1.requirePermissions)(permissions);
};
exports.RequirePermissions = RequirePermissions;
