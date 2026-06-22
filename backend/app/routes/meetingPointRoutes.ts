import { Router } from 'express';
import { MeetingPointController } from '../controllers/meetingPointController';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', requireAuth, MeetingPointController.list);
router.post('/', requireAuth, requireRole(['ADMIN']), MeetingPointController.create);
router.delete('/:id', requireAuth, requireRole(['ADMIN']), MeetingPointController.remove);

export default router;