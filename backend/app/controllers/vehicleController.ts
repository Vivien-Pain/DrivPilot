import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { VehicleService } from '../services/vehicleService';

export class VehicleController {
    static async create(req: AuthenticatedRequest, res: Response) {
        try {
            const result = await VehicleService.addVehicle(req.user!.schoolId, req.body);
            res.status(201).json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, error: { code: 'VEHICLE_ERROR', message: error.message } });
        }
    }

    static async getAll(req: AuthenticatedRequest, res: Response) {
        try {
            const vehicles = await VehicleService.listVehicles(req.user!.schoolId);
            res.json({ success: true, data: vehicles });
        } catch (error: any) {
            res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: error.message } });
        }
    }
}