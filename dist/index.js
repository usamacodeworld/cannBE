"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const auth_routes_1 = __importDefault(require("./modules/auth/routes/auth.routes"));
const user_routes_1 = __importDefault(require("./modules/user/routes/user.routes"));
const request_logger_middleware_1 = require("./common/middlewares/request-logger.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(request_logger_middleware_1.requestLogger);
// Routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api/users", user_routes_1.default);
// Health check
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});
app.get("/", (req, res) => {
    res.json({ status: "ok" });
});
// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
});
// Initialize TypeORM
database_1.AppDataSource.initialize()
    .then(() => {
    console.log("Database connected successfully");
    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
    .catch((error) => console.error("Error connecting to database:", error));
