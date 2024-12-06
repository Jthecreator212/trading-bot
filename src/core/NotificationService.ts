import { Alert } from '../types';

export class NotificationService {
    public sendAlert(alert: Alert): void {
        console.log(`[${alert.level.toUpperCase()}] ${alert.message}`);
    }
}

export default NotificationService;
