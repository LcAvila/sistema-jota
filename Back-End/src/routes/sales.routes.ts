import { Router } from 'express';
import * as salesController from '../controllers/sales.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

// CRUD completo para vendas
router.post('/', salesController.createSale);
router.get('/', salesController.getAllSales);
router.get('/reports', salesController.getSalesReports);
router.get('/dashboard-data', salesController.getDashboardData);
router.get('/:id', salesController.getSaleById);
router.put('/:id', salesController.updateSale);
router.delete('/:id', salesController.deleteSale);

export default router;
