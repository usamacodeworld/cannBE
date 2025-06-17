"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildWhereClause = buildWhereClause;
const typeorm_1 = require("typeorm");
function buildWhereClause(filters) {
    const where = {};
    for (const filter of filters) {
        const { field, operator = "eq", value } = filter;
        // Handle nested fields with dot notation
        const fieldPath = field.split(".");
        let currentLevel = where;
        for (let i = 0; i < fieldPath.length - 1; i++) {
            const pathPart = fieldPath[i];
            currentLevel[pathPart] = currentLevel[pathPart] || {};
            currentLevel = currentLevel[pathPart];
        }
        const lastField = fieldPath[fieldPath.length - 1];
        switch (operator) {
            case "like":
                currentLevel[lastField] = (0, typeorm_1.Like)(`%${value}%`);
                break;
            case "gt":
                currentLevel[lastField] = (0, typeorm_1.MoreThan)(value);
                break;
            case "lt":
                currentLevel[lastField] = (0, typeorm_1.LessThan)(value);
                break;
            case "gte":
                currentLevel[lastField] = (0, typeorm_1.MoreThan)(value);
                break;
            case "lte":
                currentLevel[lastField] = (0, typeorm_1.LessThan)(value);
                break;
            case "in":
                currentLevel[lastField] = (0, typeorm_1.In)(Array.isArray(value) ? value : value.split(","));
                break;
            default: // eq
                currentLevel[lastField] = value;
        }
    }
    return where;
}
