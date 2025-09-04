import { Router } from 'express';
import { importOrders } from '../controllers/imports.controller';
import { authenticateJWT } from '../middlewares/auth-bypass.middleware';
import { authorizeRole } from '../middlewares/auth-bypass.middleware';

const router = Router();

// Protegido: apenas admin e supervisor podem importar
router.post('/', authenticateJWT, authorizeRole(['admin', 'supervisor']), importOrders);

export default router;
