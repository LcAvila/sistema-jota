import { Router } from 'express';
import * as salesController from '../controllers/sales.controller';
import { authenticateJWT } from '../middlewares/auth-bypass.middleware';

const router = Router();

router.use(authenticateJWT);

// CRUD completo para vendas
router.post('/', salesController.createSale);
router.get('/', salesController.getSales);
router.get('/:id', salesController.getSaleById);
router.put('/:id', salesController.updateSale);
router.delete('/:id', salesController.deleteSale);

export default router;
