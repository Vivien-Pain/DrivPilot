import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
    PORT: z.string().default('3000'),
    DB_HOST: z.string().default('127.0.0.1'),
    DB_PORT: z.string().default('3306').transform(Number),
    DB_USER: z.string().default('root'),
    DB_PASSWORD: z.string().default(''),
    DB_NAME: z.string().default('drivpilot_db'),
    JWT_SECRET: z.string().default('drivpilot_jwt_secret_key_v1')
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    process.exit(1);
}

export const env = parsedEnv.data;