import { Router } from 'express';
import { ExamController } from '../controllers/examController';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', requireAuth, requireRole(['ADMIN', 'INSTRUCTOR']), ExamController.create);
router.get('/:studentId', requireAuth, ExamController.list);
router.get('/', requireAuth, requireRole(['STUDENT']), ExamController.list);

export default router;