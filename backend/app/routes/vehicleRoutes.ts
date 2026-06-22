import { Router } from 'express';
import { VehicleController } from '../controllers/vehicleController';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', requireAuth, requireRole(['ADMIN']), VehicleController.create);
router.get('/', requireAuth, VehicleController.getAll);

export default router;