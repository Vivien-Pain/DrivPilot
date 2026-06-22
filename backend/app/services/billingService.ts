import { pool } from '../config/database';

export class BillingService {
    static async createPack(schoolId: string | number, data: { name: string, hours: number, price: number }) {
        const [result]: any = await pool.query(
            'INSERT INTO hour_packs (school_id, name, hours, price) VALUES (?, ?, ?, ?)',
            [schoolId, data.name, data.hours, data.price]
        );
        return { id: result.insertId };
    }

    static async getPacks(schoolId: string | number) {
        const [rows] = await pool.query(
            'SELECT id, name, hours, price FROM hour_packs WHERE school_id = ? AND active = TRUE ORDER BY hours ASC',
            [schoolId]
        );
        return rows;
    }

    static async purchasePack(schoolId: string | number, studentId: string | number, packId: string | number) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const [packs]: any = await connection.query(
                'SELECT hours, price FROM hour_packs WHERE id = ? AND school_id = ? AND active = TRUE',
                [packId, schoolId]
            );

            if (!packs.length) throw new Error('PACK_NOT_FOUND');

            const pack = packs[0];

            const [purchaseResult]: any = await connection.query(
                'INSERT INTO purchases (school_id, student_id, pack_id, amount) VALUES (?, ?, ?, ?)',
                [schoolId, studentId, packId, pack.price]
            );

            await connection.query(
                'UPDATE student_profiles SET hours_purchased = hours_purchased + ? WHERE user_id = ? AND school_id = ?',
                [pack.hours, studentId, schoolId]
            );

            await connection.commit();
            return { purchaseId: purchaseResult.insertId, addedHours: pack.hours };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}