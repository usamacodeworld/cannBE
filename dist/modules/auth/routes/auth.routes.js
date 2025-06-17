"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validation_middleware_1 = require("../../../common/middlewares/validation.middleware");
const login_dto_1 = require("../dto/login.dto");
const router = (0, express_1.Router)();
router.post('/login', (0, validation_middleware_1.validateDto)(login_dto_1.LoginDto), auth_controller_1.login);
exports.default = router;
