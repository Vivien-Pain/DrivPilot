import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { z } from 'zod';

const registerSchema = z.object({
    schoolName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().min(2),
    lastName: z.string().min(2)
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});

export class AuthController {
    static async register(req: Request, res: Response): Promise<void> {
        try {
            const validatedData = registerSchema.parse(req.body);
            const result = await AuthService.registerSchool(validatedData);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'REGISTRATION_ERROR';
            res.status(400).json({
                success: false,
                error: { code: 'REGISTRATION_FAILED', message }
            });
        }
    }

    static async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = loginSchema.parse(req.body);
            const result = await AuthService.login(email, password);
            res.json({ success: true, data: result });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'AUTH_ERROR';
            res.status(401).json({
                success: false,
                error: { code: 'AUTH_FAILED', message }
            });
        }
    }
}