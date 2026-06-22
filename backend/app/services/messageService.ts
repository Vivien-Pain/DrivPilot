import { pool } from '../config/database';

export class MessageService {
    static async sendMessage(schoolId: string | number, senderId: string | number, receiverId: string | number, content: string) {
        const [result]: any = await pool.query(
            'INSERT INTO messages (school_id, sender_id, receiver_id, content) VALUES (?, ?, ?, ?)',
            [schoolId, senderId, receiverId, content]
        );
        return { id: result.insertId };
    }

    static async getMessages(schoolId: string | number, userId: string | number, contactId: string | number) {
        const [rows] = await pool.query(
            `SELECT m.id, m.sender_id, m.receiver_id, m.content, m.created_at, 
             s.first_name as sender_first_name, s.last_name as sender_last_name
             FROM messages m
             JOIN users s ON m.sender_id = s.id
             WHERE m.school_id = ? 
               AND ((m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?))
             ORDER BY m.created_at ASC`,
            [schoolId, userId, contactId, contactId, userId]
        );
        return rows;
    }

    static async getContacts(schoolId: string | number, userId: string | number, role: string) {
        let query = 'SELECT id, first_name, last_name, role FROM users WHERE school_id = ? AND id != ?';
        const params: any[] = [schoolId, userId];

        if (role === 'STUDENT') {
            query += ' AND role IN ("ADMIN", "INSTRUCTOR")';
        }

        const [rows] = await pool.query(query, params);
        return rows;
    }
}