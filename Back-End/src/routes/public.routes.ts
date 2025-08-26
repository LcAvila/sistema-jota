import { Router } from 'express';
import { getRecentOrdersPublic, getKpisPublic } from '../controllers/public.controller';

const router = Router();

router.get('/recent-orders', getRecentOrdersPublic);
router.get('/kpis', getKpisPublic);

export default router;
