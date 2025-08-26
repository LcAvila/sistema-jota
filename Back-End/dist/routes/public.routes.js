"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const public_controller_1 = require("../controllers/public.controller");
const router = (0, express_1.Router)();
router.get('/recent-orders', public_controller_1.getRecentOrdersPublic);
router.get('/kpis', public_controller_1.getKpisPublic);
exports.default = router;
