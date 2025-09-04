import { Router } from 'express';
import * as ordersController from '../controllers/orders.controller';

import { authenticateJWT } from '../middlewares/auth-bypass.middleware';
import { authorizeRole } from '../middlewares/auth-bypass.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', ordersController.getAllOrders);
router.get('/:id', ordersController.getOrderById);
router.post('/', authorizeRole(['admin', 'supervisor', 'seller']), ordersController.createOrder);
router.put('/:id/status', authorizeRole(['admin', 'supervisor']), ordersController.updateOrderStatus);
router.delete('/:id', authorizeRole(['admin']), ordersController.deleteOrder);

export default router;
