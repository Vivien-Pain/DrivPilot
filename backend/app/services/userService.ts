import bcrypt from 'bcrypt';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '../config/database';

interface UserData {
    email: string;
    role: 'INSTRUCTOR' | 'STUDENT';
    password?: string;
    firstName: string;
    lastName: string;
    phone?: string;
    hoursPurchased?: number;
}

interface StudentImportData {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
}

interface UserRow extends RowDataPacket {
    id: string | number;
    email: string;
    role: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    created_at: string;
}

interface ExistingUserRow extends RowDataPacket {
    id: string | number;
}

export class UserService {
    static async createUser(schoolId: string | number, userData: UserData) {
        const hashedPassword = await bcrypt.hash(userData.password || 'DrivPilot2026!', 10);
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const cleanEmail = userData.email.trim().toLowerCase();
            const [userResult] = await connection.query<ResultSetHeader>(
                'INSERT INTO users (school_id, role, email, password_hash, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [schoolId, userData.role, cleanEmail, hashedPassword, userData.firstName.trim(), userData.lastName.trim(), userData.phone?.trim() || null]
            );
            const userId = userResult.insertId;

            if (userData.role === 'STUDENT') {
                await connection.query<ResultSetHeader>(
                    'INSERT INTO student_profiles (user_id, school_id, hours_purchased) VALUES (?, ?, ?)',
                    [userId, schoolId, userData.hoursPurchased || 0]
                );
            }

            await connection.commit();
            return { id: String(userId) };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async bulkCreateStudents(schoolId: string | number, students: StudentImportData[]) {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();
            let addedCount = 0;
            const defaultPassword = await bcrypt.hash('DrivPilot2026!', 10);

            for (const student of students) {
                const cleanEmail = student.email.trim().toLowerCase();
                const [existing] = await connection.query<ExistingUserRow[]>(
                    'SELECT id FROM users WHERE email = ?',
                    [cleanEmail]
                );

                if (existing.length > 0) continue;

                const [userResult] = await connection.query<ResultSetHeader>(
                    'INSERT INTO users (school_id, role, email, password_hash, first_name, last_name, phone) VALUES (?, "STUDENT", ?, ?, ?, ?, ?)',
                    [schoolId, cleanEmail, defaultPassword, student.firstName.trim(), student.lastName.trim(), student.phone?.trim() || null]
                );
                const userId = userResult.insertId;

                await connection.query<ResultSetHeader>(
                    'INSERT INTO student_profiles (user_id, school_id, hours_purchased) VALUES (?, ?, 0)',
                    [userId, schoolId]
                );

                addedCount++;
            }

            await connection.commit();
            return { added: addedCount, total: students.length };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async getUsersBySchool(schoolId: string | number, role?: string) {
        let query = 'SELECT id, email, role, first_name, last_name, phone, created_at FROM users WHERE school_id = ?';
        const params: (string | number)[] = [schoolId];

        if (role) {
            query += ' AND role = ?';
            params.push(role);
        }

        const [rows] = await pool.query<UserRow[]>(query, params);
        return rows;
    }

    static async deleteUser(schoolId: string | number, userId: string | number) {
        await pool.query<ResultSetHeader>('DELETE FROM users WHERE id = ? AND school_id = ?', [userId, schoolId]);
    }
}