import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { MessageService } from '../services/messageService';
import { z } from 'zod';

const messageSchema = z.object({
    receiverId: z.union([z.string(), z.number()]),
    content: z.string().min(1)
});

export class MessageController {
    static async send(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { receiverId, content } = messageSchema.parse(req.body);
            const result = await MessageService.sendMessage(req.user!.schoolId, req.user!.userId, receiverId, content);
            res.status(201).json({ success: true, data: result });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'MESSAGE_SEND_ERROR';
            res.status(400).json({ success: false, error: { code: 'MESSAGE_SEND_ERROR', message } });
        }
    }

    static async listMessages(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { contactId } = req.params;
            if (!contactId) {
                throw new Error('Missing contactId parameter');
            }
            const messages = await MessageService.getMessages(req.user!.schoolId, req.user!.userId, contactId);
            res.json({ success: true, data: messages });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'FETCH_ERROR';
            res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message } });
        }
    }

    static async listContacts(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const contacts = await MessageService.getContacts(req.user!.schoolId, req.user!.userId, req.user!.role);
            res.json({ success: true, data: contacts });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'FETCH_ERROR';
            res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message } });
        }
    }
}