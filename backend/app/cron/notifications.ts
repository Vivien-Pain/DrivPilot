import cron from 'node-cron';
import { NotificationService } from '../services/notificationService';

export const startCronJobs = () => {
    cron.schedule('*/15 * * * *', async () => {
        try {
            await NotificationService.processReminders();
        } catch (error) {
            console.error('CRON_ERROR', error);
        }
    });
};