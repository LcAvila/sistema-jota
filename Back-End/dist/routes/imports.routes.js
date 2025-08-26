"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const imports_controller_1 = require("../controllers/imports.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const authorizeRole_middleware_1 = require("../middlewares/authorizeRole.middleware");
const router = (0, express_1.Router)();
// Protegido: apenas admin e supervisor podem importar
router.post('/', auth_middleware_1.authenticateJWT, (0, authorizeRole_middleware_1.authorizeRole)(['admin', 'supervisor']), imports_controller_1.importSales);
exports.default = router;
