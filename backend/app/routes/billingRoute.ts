import { Router } from 'express';
import { BillingController } from '../controllers/billingController';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.post('/packs', requireAuth, requireRole(['ADMIN']), BillingController.addPack);
router.get('/packs', requireAuth, BillingController.listPacks);
router.post('/purchase', requireAuth, requireRole(['STUDENT']), BillingController.buyPack);

export default router;