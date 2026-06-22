import { Router } from 'express';
import { SchoolController } from '../controllers/schoolController';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.get('/stats', requireAuth, requireRole(['ADMIN']), SchoolController.getStats);
router.get('/activity', requireAuth, requireRole(['ADMIN']), SchoolController.getActivity);

export default router;