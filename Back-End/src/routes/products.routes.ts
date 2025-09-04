import { Router } from 'express';
import * as productsController from '../controllers/products.controller';

const { authenticateJWT, authorizeRole } = require('../middlewares/auth-bypass.middleware');

const router = Router();

router.use(authenticateJWT);

router.get('/', productsController.getAllProducts);
router.get('/:id', productsController.getProductById);
router.post('/', authorizeRole('admin'), productsController.createProduct);
router.put('/:id', authorizeRole('admin'), productsController.updateProduct);
router.delete('/:id', authorizeRole('admin'), productsController.deleteProduct);
router.post('/bulk-import', authorizeRole('admin'), productsController.bulkImportProducts);

export default router;
