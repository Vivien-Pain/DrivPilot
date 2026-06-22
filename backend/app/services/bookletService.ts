import { pool } from '../config/database';

export class BookletService {
    static async updateSkillStatus(schoolId: string, studentId: string | number, instructorId: string, skillName: string, status: "NOT_STARTED" | "IN_PROGRESS" | "ACQUIRED") {
        const [existing]: any = await pool.query(
            'SELECT id FROM booklet_entries WHERE school_id = ? AND student_id = ? AND skill_name = ?',
            [schoolId, studentId, skillName]
        );

        if (existing.length > 0) {
            await pool.query(
                'UPDATE booklet_entries SET status = ?, instructor_id = ?, validated_at = ? WHERE id = ?',
                [status, instructorId, status === 'ACQUIRED' ? new Date() : null, existing[0].id]
            );
        } else {
            await pool.query(
                'INSERT INTO booklet_entries (school_id, student_id, instructor_id, skill_name, status, validated_at) VALUES (?, ?, ?, ?, ?, ?)',
                [schoolId, studentId, instructorId, skillName, status, status === 'ACQUIRED' ? new Date() : null]
            );
        }
    }

    static async getStudentBooklet(schoolId: string, studentId: string | string[]) {
        const [rows] = await pool.query(
            'SELECT skill_name, status, validated_at FROM booklet_entries WHERE school_id = ? AND student_id = ?',
            [schoolId, studentId]
        );
        return rows;
    }
}