import { pool } from '../config/database';

export class NoteService {
    static async addNote(schoolId: string | number, studentId: string | number, authorId: string | number, content: string) {
        const [result]: any = await pool.query(
            'INSERT INTO internal_notes (school_id, student_id, author_id, content) VALUES (?, ?, ?, ?)',
            [schoolId, studentId, authorId, content]
        );
        return { id: result.insertId };
    }

    static async getNotes(schoolId: string | number, studentId: string | number) {
        const [rows] = await pool.query(
            `SELECT n.id, n.content, n.created_at, u.first_name, u.last_name, u.role
             FROM internal_notes n
                      JOIN users u ON n.author_id = u.id
             WHERE n.school_id = ? AND n.student_id = ?
             ORDER BY n.created_at DESC`,
            [schoolId, studentId]
        );
        return rows;
    }
}