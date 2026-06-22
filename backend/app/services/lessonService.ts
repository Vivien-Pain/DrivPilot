import { pool } from '../config/database';

export class LessonService {
    static async getCalendar(schoolId: string | number, instructorId?: string | number) {
        let query = 'SELECT l.*, u.first_name, u.last_name FROM lessons l LEFT JOIN users u ON l.student_id = u.id WHERE l.school_id = ?';
        const params: any[] = [schoolId];

        if (instructorId) {
            query += ' AND l.instructor_id = ?';
            params.push(instructorId);
        }

        const [rows] = await pool.query(query, params);
        return rows;
    }

    static async createAvailability(schoolId: string | number, instructorId: string | number, slots: { start: string, end: string }[]) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            for (const slot of slots) {
                await connection.query(
                    'INSERT INTO lessons (school_id, instructor_id, start_time, end_time, status) VALUES (?, ?, ?, ?, "AVAILABLE")',
                    [schoolId, instructorId, slot.start, slot.end]
                );
            }
            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async bookLesson(schoolId: string | number, studentId: string | number, lessonId: string | number, meetingPoint: string) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const [lessons]: any = await connection.query(
                'SELECT * FROM lessons WHERE id = ? AND school_id = ? AND status = "AVAILABLE" FOR UPDATE',
                [lessonId, schoolId]
            );

            if (lessons.length === 0) throw new Error('LESSON_NOT_AVAILABLE');

            const [profiles]: any = await connection.query(
                'SELECT hours_purchased FROM student_profiles WHERE user_id = ? AND school_id = ?',
                [studentId, schoolId]
            );

            if (!profiles[0] || profiles[0].hours_purchased <= 0) {
                throw new Error('INSUFFICIENT_HOURS');
            }

            await connection.query(
                'UPDATE lessons SET student_id = ?, status = "BOOKED", meeting_point = ? WHERE id = ?',
                [studentId, meetingPoint, lessonId]
            );

            await connection.query(
                'UPDATE student_profiles SET hours_purchased = hours_purchased - 1 WHERE user_id = ? AND school_id = ?',
                [studentId, schoolId]
            );

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async cancelLesson(schoolId: string | number, userId: string | number, userRole: string, lessonId: string | number) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const [lessons]: any = await connection.query(
                'SELECT start_time, student_id FROM lessons WHERE id = ? AND school_id = ? AND status = "BOOKED" FOR UPDATE',
                [lessonId, schoolId]
            );

            if (lessons.length === 0) throw new Error('LESSON_NOT_FOUND_OR_NOT_BOOKED');

            const lesson = lessons[0];

            if (userRole === 'STUDENT') {
                if (lesson.student_id !== userId) throw new Error('UNAUTHORIZED');

                const startTime = new Date(lesson.start_time).getTime();
                const now = new Date().getTime();
                const hoursDifference = (startTime - now) / (1000 * 60 * 60);

                if (hoursDifference < 48) {
                    throw new Error('CANCELLATION_TOO_LATE_48H');
                }
            }

            await connection.query(
                'UPDATE lessons SET student_id = NULL, status = "AVAILABLE", meeting_point = NULL WHERE id = ?',
                [lessonId]
            );

            await connection.query(
                'UPDATE student_profiles SET hours_purchased = hours_purchased + 1 WHERE user_id = ? AND school_id = ?',
                [lesson.student_id, schoolId]
            );

            const [students]: any = await connection.query(
                `SELECT email FROM users WHERE school_id = ? AND role = 'STUDENT' AND id != ?`,
                [schoolId, lesson.student_id]
            );

            if (userRole === 'ADMIN' || userRole === 'INSTRUCTOR') {
                console.log(`[BOURSE D'ÉCHANGE] Envoi d'une notification push à ${students.length} élèves pour le créneau libéré le ${lesson.start_time}`);
            }

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}