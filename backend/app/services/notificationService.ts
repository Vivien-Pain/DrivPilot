    import { pool } from '../config/database';

    export class NotificationService {
        static async processReminders() {
            const connection = await pool.getConnection();
            try {
                await connection.beginTransaction();

                const [lessons24h]: any = await connection.query(
                    `SELECT l.id, l.start_time, u.email, u.phone, u.first_name, u.last_name
                     FROM lessons l
                              JOIN users u ON l.student_id = u.id
                     WHERE l.status = "BOOKED"
                       AND l.start_time BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 24 HOUR)
                       AND l.id NOT IN (SELECT lesson_id FROM lesson_notifications WHERE type = "24H")`
                );

                for (const lesson of lessons24h) {
                    await this.sendAlert(lesson.email, lesson.phone, `Rappel: Leçon dans 24h, ${lesson.first_name}`);
                    await connection.query(
                        'INSERT INTO lesson_notifications (lesson_id, type) VALUES (?, "24H")',
                        [lesson.id]
                    );
                }

                const [lessons2h]: any = await connection.query(
                    `SELECT l.id, l.start_time, u.email, u.phone, u.first_name, u.last_name
                     FROM lessons l
                              JOIN users u ON l.student_id = u.id
                     WHERE l.status = "BOOKED"
                       AND l.start_time BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 2 HOUR)
                       AND l.id NOT IN (SELECT lesson_id FROM lesson_notifications WHERE type = "2H")`
                );

                for (const lesson of lessons2h) {
                    await this.sendAlert(lesson.email, lesson.phone, `Rappel urgent: Leçon dans 2h, ${lesson.first_name}`);
                    await connection.query(
                        'INSERT INTO lesson_notifications (lesson_id, type) VALUES (?, "2H")',
                        [lesson.id]
                    );
                }

                await connection.commit();
                return {
                    processed24h: lessons24h.length,
                    processed2h: lessons2h.length
                };
            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }
        }

        private static async sendAlert(email: string, phone: string, message: string) {
            console.log(JSON.stringify({ to: email, phone, message, timestamp: new Date() }));
        }
    }