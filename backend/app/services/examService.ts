import { pool } from '../config/database';

export class ExamService {
    static async saveMockExam(schoolId: string | number, studentId: string | number, instructorId: string | number, score: number, remarks: string) {
        if (score < 0 || score > 31) throw new Error('INVALID_SCORE');

        const [result]: any = await pool.query(
            'INSERT INTO mock_exams (school_id, student_id, instructor_id, score, remarks) VALUES (?, ?, ?, ?, ?)',
            [schoolId, studentId, instructorId, score, remarks]
        );

        return { id: result.insertId, status: score >= 20 ? 'FAVORABLE' : 'DEFAVORABLE', message: 'PDF Généré simulé' };
    }

    static async getStudentExams(schoolId: string | number, studentId: string | string[]) {
        const [rows] = await pool.query(
            `SELECT m.*, u.first_name as instructor_first_name 
             FROM mock_exams m 
             JOIN users u ON m.instructor_id = u.id 
             WHERE m.school_id = ? AND m.student_id = ? 
             ORDER BY m.created_at DESC`,
            [schoolId, studentId]
        );
        return rows;
    }
}