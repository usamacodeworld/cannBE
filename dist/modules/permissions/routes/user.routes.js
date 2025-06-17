"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../../auth/middlewares/auth.middleware");
const validation_middleware_1 = require("../../../common/middlewares/validation.middleware");
const create_user_dto_1 = require("../dto/create-user.dto");
const get_users_query_dto_1 = require("../dto/get-users-query.dto");
const router = (0, express_1.Router)();
// Public routes
router.post("/register", (0, validation_middleware_1.validateDto)(create_user_dto_1.CreateUserDto), user_controller_1.register);
// Protected routes
router.get("/profile", auth_middleware_1.authenticate, user_controller_1.getProfile);
router.get("/", auth_middleware_1.authenticate, (0, validation_middleware_1.validateDto)(get_users_query_dto_1.GetUsersQueryDto), user_controller_1.getUsers);
exports.default = router;
