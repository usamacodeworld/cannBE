"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cuid = void 0;
const cuid2_1 = require("@paralleldrive/cuid2");
const cuid = () => (0, cuid2_1.createId)();
exports.cuid = cuid;
