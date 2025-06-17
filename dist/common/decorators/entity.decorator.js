"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseEntityDecorator = BaseEntityDecorator;
const typeorm_1 = require("typeorm");
function BaseEntityDecorator(options = {}) {
    return function (target) {
        (0, typeorm_1.Entity)(options)(target);
    };
}
