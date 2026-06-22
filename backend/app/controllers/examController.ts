import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { ExamService } from '../services/examService';
import { z } from 'zod';

const examSchema = z.object({
    studentId: z.union([z.string(), z.number()]),
    score: z.number().min(0).max(31),
    remarks: z.string()
});

export class ExamController {
    static async create(req: AuthenticatedRequest, res: Response) {
        try {
            const { studentId, score, remarks } = examSchema.parse(req.body);
            const result = await ExamService.saveMockExam(req.user!.schoolId, studentId, req.user!.userId, score, remarks);
            res.status(201).json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, error: { code: 'EXAM_CREATION_ERROR', message: error.message } });
        }
    }

    static async list(req: AuthenticatedRequest, res: Response) {
        try {
            const studentId = req.user!.role === 'STUDENT' ? req.user!.userId : req.params.studentId;
            if (!studentId) throw new Error('Missing studentId');

            const exams = await ExamService.getStudentExams(req.user!.schoolId, studentId);
            res.json({ success: true, data: exams });
        } catch (error: any) {
            res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: error.message } });
        }
    }
}