import { pool } from '../config/database';

export class SchoolService {
    static async getDashboardStats(schoolId: string) {
        const [totalStudents]: any = await pool.query(
            'SELECT COUNT(*) as count FROM users WHERE school_id = ? AND role = "STUDENT"',
            [schoolId]
        );

        const [totalLessons]: any = await pool.query(
            'SELECT COUNT(*) as count FROM lessons WHERE school_id = ?',
            [schoolId]
        );

        const [noShows]: any = await pool.query(
            'SELECT COUNT(*) as count FROM lessons WHERE school_id = ? AND status = "CANCELLED"',
            [schoolId]
        );

        const [activeInstructors]: any = await pool.query(
            'SELECT COUNT(*) as count FROM users WHERE school_id = ? AND role = "INSTRUCTOR"',
            [schoolId]
        );

        const noShowRate = totalLessons[0].count > 0
            ? (noShows[0].count / totalLessons[0].count) * 100
            : 0;

        return {
            studentCount: totalStudents[0].count,
            instructorCount: activeInstructors[0].count,
            noShowRate: noShowRate.toFixed(2),
            totalLessons: totalLessons[0].count
        };
    }

    static async getRecentActivity(schoolId: string) {
        const [rows]: any = await pool.query(
            `SELECT l.*, u.first_name, u.last_name 
       FROM lessons l 
       LEFT JOIN users u ON l.student_id = u.id 
       WHERE l.school_id = ? 
       ORDER BY l.created_at DESC LIMIT 5`,
            [schoolId]
        );
        return rows;
    }
}