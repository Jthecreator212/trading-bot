import { Logger } from './Logger';

export interface Notification {
    id: string;
    type: 'EMAIL' | 'SMS' | 'PUSH';
    recipient: string;
    subject: string;
    message: string;
    timestamp: number;
}

export class NotificationService {
    private static instance: NotificationService;
    private logger: Logger;
    private notifications: Notification[];

    private constructor() {
        this.logger = Logger.getInstance();
        this.notifications = [];
    }

    static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    sendNotification(notification: Notification): void {
        this.notifications.push(notification);
        this.logger.info(`Notification sent: ${notification.subject} to ${notification.recipient}`);
        
        // Here you would integrate with an actual notification service
        // For example, sending an email, SMS, or push notification
    }

    getNotifications(): Notification[] {
        return this.notifications;
    }

    getNotificationsByType(type: 'EMAIL' | 'SMS' | 'PUSH'): Notification[] {
        return this.notifications.filter(notification => notification.type === type);
    }

    getNotificationsByRecipient(recipient: string): Notification[] {
        return this.notifications.filter(notification => notification.recipient === recipient);
    }

    clearNotifications(): void {
        this.notifications = [];
        this.logger.info('All notifications cleared');
    }
}
