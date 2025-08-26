import { Router } from 'express';
import * as ordersController from '../controllers/orders.controller';

import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRole } from '../middlewares/authorizeRole.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', ordersController.getAllOrders);
router.get('/:id', ordersController.getOrderById);
router.post('/', authorizeRole(['admin', 'supervisor', 'seller']), ordersController.createOrder);
router.put('/:id', authorizeRole(['admin', 'supervisor']), ordersController.updateOrder);
router.delete('/:id', authorizeRole(['admin']), ordersController.deleteOrder);

// transição de status e logs
router.post('/:id/status', authorizeRole(['admin', 'supervisor', 'kitchen', 'delivery']), ordersController.changeOrderStatus);
router.get('/:id/logs', authorizeRole(['admin', 'supervisor']), ordersController.getOrderLogs);

export default router;
