import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        schoolId: string;
        role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
    };
    params: Record<string, string>;
}

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Missing or invalid token format' }
            });
            return;
        }

        const token = authHeader.split(' ')[1];
        req.user = verifyToken(token);

        next();
    } catch (error: unknown) {
        res.status(401).json({
            success: false,
            error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' }
        });
    }
};

export const requireRole = (roles: Array<'ADMIN' | 'INSTRUCTOR' | 'STUDENT'>) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                error: { code: 'FORBIDDEN', message: 'Insufficient permissions' }
            });
            return;
        }
        next();
    };
};