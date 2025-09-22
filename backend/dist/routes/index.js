"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRoutes = setupRoutes;
const auth_1 = __importDefault(require("./auth"));
const payments_1 = __importDefault(require("./payments"));
const content_1 = __importDefault(require("./content"));
const users_1 = __importDefault(require("./users"));
const admin_1 = __importDefault(require("./admin"));
const cams_1 = __importDefault(require("./cams"));
const flavourstalk_1 = __importDefault(require("./flavourstalk"));
const notifications_1 = __importDefault(require("./notifications"));
const analytics_1 = __importDefault(require("./analytics"));
function setupRoutes(app) {
    const API_PREFIX = '/api/v1';
    app.use(`${API_PREFIX}/auth`, auth_1.default);
    app.use(`${API_PREFIX}/payments`, payments_1.default);
    app.use(`${API_PREFIX}/content`, content_1.default);
    app.use(`${API_PREFIX}/users`, users_1.default);
    app.use(`${API_PREFIX}/admin`, admin_1.default);
    app.use(`${API_PREFIX}/cams`, cams_1.default);
    app.use(`${API_PREFIX}/flavourstalk`, flavourstalk_1.default);
    app.use(`${API_PREFIX}/notifications`, notifications_1.default);
    app.use(`${API_PREFIX}/analytics`, analytics_1.default);
    app.use('*', (req, res) => {
        res.status(404).json({
            error: 'Route not found',
            path: req.originalUrl
        });
    });
}
//# sourceMappingURL=index.js.map