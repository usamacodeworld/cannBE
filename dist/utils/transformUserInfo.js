"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformFullUserInfo = exports.transformUserInfo = void 0;
const transformUserInfo = (user) => {
    return {
        id: user.id,
        type: user.type,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roles: user.roles?.map((role) => ({
            id: role.id,
            name: role.name
        }))
    };
};
exports.transformUserInfo = transformUserInfo;
const transformFullUserInfo = (user) => {
    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user?.phone,
        type: user.type,
        emailVerified: user?.emailVerified,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        roles: user?.roles,
    };
};
exports.transformFullUserInfo = transformFullUserInfo;
