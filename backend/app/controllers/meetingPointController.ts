import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { MeetingPointService } from '../services/meetingPointService';
import { z } from 'zod';

const pointSchema = z.object({
    name: z.string().min(2),
    address: z.string().min(5)
});

export class MeetingPointController {
    static async create(req: AuthenticatedRequest, res: Response) {
        try {
            const { name, address } = pointSchema.parse(req.body);
            const result = await MeetingPointService.addMeetingPoint(req.user!.schoolId, name, address);
            res.status(201).json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, error: { code: 'MEETING_POINT_ERROR', message: error.message } });
        }
    }

    static async list(req: AuthenticatedRequest, res: Response) {
        try {
            const points = await MeetingPointService.getMeetingPoints(req.user!.schoolId);
            res.json({ success: true, data: points });
        } catch (error: any) {
            res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: error.message } });
        }
    }

    static async remove(req: AuthenticatedRequest, res: Response) {
        try {
            await MeetingPointService.deleteMeetingPoint(req.user!.schoolId, req.params.id);
            res.json({ success: true });
        } catch (error: any) {
            res.status(500).json({ success: false, error: { code: 'DELETE_ERROR', message: error.message } });
        }
    }
}