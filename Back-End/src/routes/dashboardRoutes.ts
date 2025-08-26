import { Router } from 'express';
import { getDashboardMetrics, getDashboardFilterOptions } from '../controllers/dashboardController';

const router = Router();

router.get('/', getDashboardMetrics);
router.get('/filters', getDashboardFilterOptions);

export default router;
