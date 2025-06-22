"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Roles = void 0;
// Simple metadata function instead of NestJS SetMetadata
const Roles = (...roles) => {
    return (target, propertyKey, descriptor) => {
        if (descriptor) {
            descriptor.value = descriptor.value || {};
            descriptor.value.roles = roles;
        }
        return descriptor;
    };
};
exports.Roles = Roles;
