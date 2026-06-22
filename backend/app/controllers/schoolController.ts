import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { SchoolService } from '../services/schoolService';

export class SchoolController {
    static async getStats(req: AuthenticatedRequest, res: Response) {
        try {
            const stats = await SchoolService.getDashboardStats(req.user!.schoolId);
            res.json({ success: true, data: stats });
        } catch (error: any) {
            res.status(500).json({ success: false, error: { code: 'STATS_ERROR', message: error.message } });
        }
    }

    static async getActivity(req: AuthenticatedRequest, res: Response) {
        try {
            const activity = await SchoolService.getRecentActivity(req.user!.schoolId);
            res.json({ success: true, data: activity });
        } catch (error: any) {
            res.status(500).json({ success: false, error: { code: 'ACTIVITY_ERROR', message: error.message } });
        }
    }
}