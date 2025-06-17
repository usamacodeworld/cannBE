"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = exports.getProfile = exports.register = void 0;
const userService = __importStar(require("../services/user.service"));
const getResponseAPI_1 = require("../../../common/getResponseAPI");
const register = async (req, res, next) => {
    try {
        const newUser = await userService.createUser(req.body);
        res.json((0, getResponseAPI_1.getResponseAPI)("0", newUser));
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const getProfile = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            throw new Error("Unauthorized");
        const userProfile = await userService.getUserProfile(userId);
        res.json((0, getResponseAPI_1.getResponseAPI)("0", { user: userProfile }));
    }
    catch (error) {
        next(error);
    }
};
exports.getProfile = getProfile;
const getUsers = async (req, res, next) => {
    console.log("Response  ===> ", req);
    try {
        const query = req.query;
        const users = await userService.getUsers(query);
        res.json((0, getResponseAPI_1.getResponseAPI)("0", users));
    }
    catch (error) {
        res.json((0, getResponseAPI_1.getResponseAPI)("0", { errors: error }));
        next(error);
    }
};
exports.getUsers = getUsers;
