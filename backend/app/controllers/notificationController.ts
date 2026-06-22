import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { NotificationService } from '../services/NotificationService';

export class NotificationController {
    static async triggerReminders(req: AuthenticatedRequest, res: Response) {
        try {
            const result = await NotificationService.processReminders();
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(500).json({ success: false, error: { code: 'NOTIFICATION_ERROR', message: error.message } });
        }
    }
}