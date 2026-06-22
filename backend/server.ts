import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { env } from './app/config/env';

import authRoutes from './app/routes/authRoutes';
import billingRoutes from './app/routes/billingRoute';
import bookletRoutes from './app/routes/bookletRoutes';
import examRoutes from './app/routes/examRoutes';
import lessonRoutes from './app/routes/lessonRoutes';
import meetingPointRoutes from './app/routes/meetingPointRoutes';
import messageRoutes from './app/routes/messageRoutes';
import noteRoutes from './app/routes/noteRoutes';
import schoolRoutes from './app/routes/schoolRoutes';
import userRoutes from './app/routes/userRoutes';
import vehicleRoutes from './app/routes/vehicleRoutes';

import { startCronJobs } from './app/cron/notifications';

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/booklet', bookletRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/meeting-points', meetingPointRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/school', schoolRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);

startCronJobs();

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('[SERVER ERROR]', err);
    res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Erreur interne du serveur' }
    });
});

app.listen(env.PORT, () => {
    console.log(`[DRIVPILOT] Serveur API démarré avec succès sur le port ${env.PORT}`);
});