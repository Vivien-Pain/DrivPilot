import { Router } from 'express';
import { MessageController } from '../controllers/messageController';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/contacts', requireAuth, MessageController.listContacts);
router.get('/:contactId', requireAuth, MessageController.listMessages);
router.post('/', requireAuth, MessageController.send);

export default router;