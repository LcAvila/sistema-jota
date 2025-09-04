import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth-bypass.middleware';
import { authorizeRole } from '../middlewares/auth-bypass.middleware';
import * as stockController from '../controllers/stock.controller';

const router = Router();

router.use(authenticateJWT);

router.get('/overview', authorizeRole('admin'), stockController.getOverview);
router.get('/movements', authorizeRole('admin'), stockController.listMovements);
router.post('/adjust', authorizeRole('admin'), stockController.adjustStock);

export default router;
