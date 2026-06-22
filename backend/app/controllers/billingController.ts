import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { BillingService } from '../services/billingService';

export class BillingController {
    static async addPack(req: AuthenticatedRequest, res: Response) {
        try {
            const result = await BillingService.createPack(req.user!.schoolId, req.body);
            res.status(201).json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, error: { code: 'PACK_CREATION_ERROR', message: error.message } });
        }
    }

    static async listPacks(req: AuthenticatedRequest, res: Response) {
        try {
            const packs = await BillingService.getPacks(req.user!.schoolId);
            res.json({ success: true, data: packs });
        } catch (error: any) {
            res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: error.message } });
        }
    }

    static async buyPack(req: AuthenticatedRequest, res: Response) {
        try {
            const { packId } = req.body;
            const result = await BillingService.purchasePack(req.user!.schoolId, req.user!.userId, packId);
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, error: { code: 'PURCHASE_ERROR', message: error.message } });
        }
    }
}