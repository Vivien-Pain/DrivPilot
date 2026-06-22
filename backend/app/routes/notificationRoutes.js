import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.post('/trigger', requireAuth, requireRole(['ADMIN']), NotificationController.triggerReminders);

export default router;