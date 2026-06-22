import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { NoteService } from '../services/noteService';
import { z } from 'zod';

const noteSchema = z.object({
    studentId: z.union([z.string(), z.number()]),
    content: z.string().min(1)
});

export class NoteController {
    static async create(req: AuthenticatedRequest, res: Response) {
        try {
            const { studentId, content } = noteSchema.parse(req.body);
            const result = await NoteService.addNote(req.user!.schoolId, studentId, req.user!.userId, content);
            res.status(201).json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, error: { code: 'NOTE_CREATION_ERROR', message: error.message } });
        }
    }

    static async list(req: AuthenticatedRequest, res: Response) {
        try {
            const { studentId } = req.params;
            const notes = await NoteService.getNotes(req.user!.schoolId, studentId);
            res.json({ success: true, data: notes });
        } catch (error: any) {
            res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: error.message } });
        }
    }
}