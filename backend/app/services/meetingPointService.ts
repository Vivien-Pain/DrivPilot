import { pool } from '../config/database';

export class MeetingPointService {
    static async addMeetingPoint(schoolId: string | number, name: string, address: string) {
        const [result]: any = await pool.query(
            'INSERT INTO meeting_points (school_id, name, address) VALUES (?, ?, ?)',
            [schoolId, name, address]
        );
        return { id: result.insertId };
    }

    static async getMeetingPoints(schoolId: string | number) {
        const [rows] = await pool.query(
            'SELECT id, name, address FROM meeting_points WHERE school_id = ?',
            [schoolId]
        );
        return rows;
    }

    static async deleteMeetingPoint(schoolId: string | number, pointId: string | number) {
        await pool.query(
            'DELETE FROM meeting_points WHERE id = ? AND school_id = ?',
            [pointId, schoolId]
        );
    }
}