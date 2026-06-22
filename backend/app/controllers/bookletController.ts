import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { BookletService } from '../services/bookletService';
import { z } from 'zod';

const skillUpdateSchema = z.object({
    studentId: z.union([z.string(), z.number()]),
    skillName: z.string().min(1),
    status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'ACQUIRED'])
});

export class BookletController {
    static async updateSkill(req: AuthenticatedRequest, res: Response) {
        try {
            const { studentId, skillName, status } = skillUpdateSchema.parse(req.body);
            await BookletService.updateSkillStatus(req.user!.schoolId, studentId, req.user!.userId, skillName, status);
            res.json({ success: true, data: { message: 'Skill updated' } });
        } catch (error: any) {
            res.status(400).json({ success: false, error: { code: 'UPDATE_ERROR', message: error.message } });
        }
    }

    static async getBooklet(req: AuthenticatedRequest, res: Response) {
        try {
            const studentId = req.user!.role === 'STUDENT' ? req.user!.userId : req.params.studentId;
            const booklet = await BookletService.getStudentBooklet(req.user!.schoolId, studentId);
            res.json({ success: true, data: booklet });
        } catch (error: any) {
            res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: error.message } });
        }
    }
}