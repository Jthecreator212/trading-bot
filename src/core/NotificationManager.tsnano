import { Logger } from './Logger';

enum NotificationLevel {
    INFO = 'INFO',
    WARNING = 'WARNING',
    ALERT = 'ALERT',
    CRITICAL = 'CRITICAL'
}

interface Notification {
    level: NotificationLevel;
    message: string;
    timestamp: Date;
    data?: any;
}

export class NotificationManager {
    private static instance: NotificationManager;
    private logger: Logger;
    private notifications: Notification[];
    private webhookUrl?: string;
    private emailConfig?: {
        to: string;
        from: string;
    };

    private constructor() {
        this.logger = Logger.getInstance();
        this.notifications = [];
    }

    static getInstance(): NotificationManager {
        if (!NotificationManager.instance) {
            NotificationManager.instance = new NotificationManager();
        }
        return NotificationManager.instance;
    }

    setWebhook(url: string): void {
        this.webhookUrl = url;
        this.logger.info('Webhook URL configured');
    }

    setEmailConfig(config: { to: string; from: string }): void {
        this.emailConfig = config;
        this.logger.info('Email configuration set');
    }

    async sendNotification(
        level: NotificationLevel,
        message: string,
        data?: any
    ): Promise<void> {
        const notification: Notification = {
            level,
            message,
            timestamp: new Date(),
            data
        };

        this.notifications.push(notification);

        // Log the notification
        this.logger.info(`Notification: ${message}`, { level, data });

        // Send to configured channels
        await this.dispatchNotification(notification);
    }

    private async dispatchNotification(notification: Notification): Promise<void> {
        try {
            // Send to webhook if configured
            if (this.webhookUrl) {
                await this.sendWebhook(notification);
            }

            // Send email if configured
            if (this.emailConfig && notification.level >= NotificationLevel.ALERT) {
                await this.sendEmail(notification);
            }
        } catch (error) {
            this.logger.error('Failed to dispatch notification', error as Error);
        }
    }

    private async sendWebhook(notification: Notification): Promise<void> {
        if (!this.webhookUrl) return;

        try {
            // Here you would implement the actual webhook sending logic
            // This is a placeholder for the webhook implementation
            console.log(`Would send webhook to ${this.webhookUrl}:`, notification);
        } catch (error) {
            this.logger.error('Failed to send webhook', error as Error);
        }
    }

    private async sendEmail(notification: Notification): Promise<void> {
        if (!this.emailConfig) return;

        try {
            // Here you would implement the actual email sending logic
            // This is a placeholder for the email implementation
            console.log(`Would send email to ${this.emailConfig.to}:`, notification);
        } catch (error) {
            this.logger.error('Failed to send email', error as Error);
        }
    }

    getRecentNotifications(count: number = 10): Notification[] {
        return this.notifications.slice(-count);
    }

    clearNotifications(): void {
        this.notifications = [];
        this.logger.info('Notifications cleared');
    }
}
