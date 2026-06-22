import { Router } from 'express';
import { NoteController } from '../controllers/noteController';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', requireAuth, requireRole(['ADMIN', 'INSTRUCTOR']), NoteController.create);
router.get('/:studentId', requireAuth, requireRole(['ADMIN', 'INSTRUCTOR']), NoteController.list);

export default router;