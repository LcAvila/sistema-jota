import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRole } from '../middlewares/authorizeRole.middleware';
import * as stockController from '../controllers/stock.controller';

const router = Router();

router.use(authenticateJWT);

router.get('/overview', authorizeRole('admin'), stockController.getOverview);
router.get('/movements', authorizeRole('admin'), stockController.listMovements);
router.post('/movements', authorizeRole('admin'), stockController.createMovement);

export default router;
