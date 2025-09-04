import { Router } from 'express';
import { getRecentOrdersPublic, getPublicStats } from '../controllers/public.controller';

const router = Router();

router.get('/recent-orders', getRecentOrdersPublic);
router.get('/kpis', getPublicStats);

export default router;
