import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { LessonService } from '../services/lessonService';
import { z } from 'zod';

const availabilitySchema = z.object({
    slots: z.array(z.object({
        start: z.string(),
        end: z.string()
    }))
});

const bookingSchema = z.object({
    lessonId: z.union([z.string(), z.number()]),
    meetingPoint: z.string().min(1)
});

export class LessonController {
    static async getCalendar(req: AuthenticatedRequest, res: Response) {
        try {
            const instructorId = req.query.instructorId as string;
            const lessons = await LessonService.getCalendar(req.user!.schoolId, instructorId);
            res.json({ success: true, data: lessons });
        } catch (error: any) {
            res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: error.message } });
        }
    }

    static async addSlots(req: AuthenticatedRequest, res: Response) {
        try {
            const validatedData = availabilitySchema.parse(req.body);
            await LessonService.createAvailability(req.user!.schoolId, req.user!.userId, validatedData.slots);
            res.json({ success: true, data: { message: 'Slots created' } });
        } catch (error: any) {
            res.status(400).json({ success: false, error: { code: 'CREATION_ERROR', message: error.message } });
        }
    }

    static async reserve(req: AuthenticatedRequest, res: Response) {
        try {
            const { lessonId, meetingPoint } = bookingSchema.parse(req.body);
            await LessonService.bookLesson(req.user!.schoolId, req.user!.userId, lessonId, meetingPoint);
            res.json({ success: true, data: { message: 'Lesson booked' } });
        } catch (error: any) {
            res.status(400).json({ success: false, error: { code: 'BOOKING_ERROR', message: error.message } });
        }
    }

    static async cancel(req: AuthenticatedRequest, res: Response) {
        try {
            const { lessonId } = req.body;
            await LessonService.cancelLesson(req.user!.schoolId, req.user!.userId, req.user!.role, lessonId);
            res.json({ success: true, data: { message: 'Lesson cancelled' } });
        } catch (error: any) {
            res.status(400).json({ success: false, error: { code: 'CANCELLATION_ERROR', message: error.message } });
        }
    }
}