// Simple metadata function instead of NestJS SetMetadata
export const Roles = (...roles: string[]) => {
    return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
        if (descriptor) {
            descriptor.value = descriptor.value || {};
            descriptor.value.roles = roles;
        }
        return descriptor;
    };
}; 