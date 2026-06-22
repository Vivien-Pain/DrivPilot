import { Router } from 'express';
import { BookletController } from '../controllers/bookletController';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.post('/update', requireAuth, requireRole(['ADMIN', 'INSTRUCTOR']), BookletController.updateSkill);
router.get('/', requireAuth, BookletController.getBooklet);
router.get('/:studentId', requireAuth, BookletController.getBooklet);

export default router;