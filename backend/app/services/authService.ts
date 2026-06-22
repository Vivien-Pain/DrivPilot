import bcrypt from 'bcrypt';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '../config/database';
import { generateToken } from '../utils/jwt';

interface UserRow extends RowDataPacket {
    id: string | number;
    school_id: string | number;
    role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
    password_hash: string;
    first_name: string;
    last_name: string;
    school_name: string;
}

interface RegisterData {
    schoolName: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export class AuthService {
    static async registerSchool(data: RegisterData) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const hashedPassword = await bcrypt.hash(data.password, 10);

            const [schoolResult] = await connection.query<ResultSetHeader>(
                'INSERT INTO schools (name) VALUES (?)',
                [data.schoolName.trim()]
            );
            const schoolId = schoolResult.insertId;

            const [userResult] = await connection.query<ResultSetHeader>(
                'INSERT INTO users (school_id, role, email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?)',
                [schoolId, 'ADMIN', data.email.trim().toLowerCase(), hashedPassword, data.firstName.trim(), data.lastName.trim()]
            );
            const userId = userResult.insertId;

            await connection.commit();
            return { userId: String(userId), schoolId: String(schoolId) };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async login(email: string, password: string) {
        const [rows] = await pool.query<UserRow[]>(
            `SELECT u.id, u.school_id, u.role, u.password_hash, u.first_name, u.last_name, s.name as school_name
             FROM users u
                      JOIN schools s ON u.school_id = s.id
             WHERE u.email = ?`,
            [email.trim().toLowerCase()]
        );

        const user = rows[0];

        if (!user) {
            throw new Error('INVALID_CREDENTIALS');
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            throw new Error('INVALID_CREDENTIALS');
        }

        const token = generateToken({
            userId: String(user.id),
            schoolId: String(user.school_id),
            role: user.role
        });

        return {
            token,
            user: {
                userId: String(user.id),
                role: user.role,
                firstName: user.first_name,
                lastName: user.last_name,
                schoolId: String(user.school_id),
                schoolName: user.school_name
            }
        };
    }
}