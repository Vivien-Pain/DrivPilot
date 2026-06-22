import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', requireAuth, requireRole(['ADMIN']), UserController.addMember);
router.post('/import', requireAuth, requireRole(['ADMIN']), UserController.importMembers);
router.get('/', requireAuth, requireRole(['ADMIN', 'INSTRUCTOR']), UserController.listMembers);
router.delete('/:id', requireAuth, requireRole(['ADMIN']), UserController.removeMember);

export default router;