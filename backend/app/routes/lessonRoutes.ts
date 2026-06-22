import { Router } from 'express';
import { LessonController } from '../controllers/lessonController';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.get('/calendar', requireAuth, LessonController.getCalendar);
router.post('/availability', requireAuth, requireRole(['ADMIN', 'INSTRUCTOR']), LessonController.addSlots);
router.post('/book', requireAuth, requireRole(['STUDENT']), LessonController.reserve);
router.post('/cancel', requireAuth, LessonController.cancel);

export default router;