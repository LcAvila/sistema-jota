import { Router } from 'express';
import { importSales } from '../controllers/imports.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRole } from '../middlewares/authorizeRole.middleware';

const router = Router();

// Protegido: apenas admin e supervisor podem importar
router.post('/', authenticateJWT, authorizeRole(['admin', 'supervisor']), importSales);

export default router;
