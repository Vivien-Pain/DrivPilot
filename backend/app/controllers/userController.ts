import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { UserService } from '../services/userService';
import { z } from 'zod';

const userSchema = z.object({
    email: z.string().email(),
    role: z.enum(['INSTRUCTOR', 'STUDENT']),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    phone: z.string().optional(),
    hoursPurchased: z.number().optional()
});

const importSchema = z.object({
    students: z.array(z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional()
    })).min(1)
});

export class UserController {
    static async addMember(req: AuthenticatedRequest, res: Response) {
        try {
            const validatedData = userSchema.parse(req.body);
            const result = await UserService.createUser(req.user!.schoolId, validatedData);
            res.status(201).json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, error: { code: 'USER_CREATION_FAILED', message: error.message } });
        }
    }

    static async importMembers(req: AuthenticatedRequest, res: Response) {
        try {
            const validatedData = importSchema.parse(req.body);
            const result = await UserService.bulkCreateStudents(req.user!.schoolId, validatedData.students);
            res.status(201).json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, error: { code: 'IMPORT_FAILED', message: error.message } });
        }
    }

    static async listMembers(req: AuthenticatedRequest, res: Response) {
        try {
            const { role } = req.query;
            const users = await UserService.getUsersBySchool(req.user!.schoolId, role as string);
            res.json({ success: true, data: users });
        } catch (error: any) {
            res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: error.message } });
        }
    }

    static async removeMember(req: AuthenticatedRequest, res: Response) {
        try {
            await UserService.deleteUser(req.user!.schoolId, req.params.id);
            res.json({ success: true });
        } catch (error: any) {
            res.status(500).json({ success: false, error: { code: 'DELETE_ERROR', message: error.message } });
        }
    }
}