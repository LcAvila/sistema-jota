import { Router } from 'express';
import { getDashboardFilterOptions, getDashboardData } from '../controllers/dashboardController';

const router = Router();

router.get('/', getDashboardData);
router.get('/filters', getDashboardFilterOptions);

export default router;
