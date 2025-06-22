"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const roles_guard_1 = require("./guards/roles.guard");
exports.AuthModule = {
    providers: [jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard],
    exports: [jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard]
};
