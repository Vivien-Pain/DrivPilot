import { pool } from '../config/database';

export class VehicleService {
    static async addVehicle(schoolId: string | number, data: any) {
        const [result]: any = await pool.query(
            'INSERT INTO vehicles (school_id, brand, model, license_plate) VALUES (?, ?, ?, ?)',
            [schoolId, data.brand, data.model, data.license_plate]
        );
        return { id: result.insertId };
    }

    static async listVehicles(schoolId: string | number) {
        const [rows] = await pool.query('SELECT * FROM vehicles WHERE school_id = ?', [schoolId]);
        return rows;
    }

    static async updateStatus(schoolId: string | number, vehicleId: string | number, status: string) {
        await pool.query('UPDATE vehicles SET status = ? WHERE id = ? AND school_id = ?', [status, vehicleId, schoolId]);
    }
}