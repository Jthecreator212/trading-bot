import { Logger } from './Logger';
import { EventEmitter } from 'events';

export class NotificationService extends EventEmitter {
    private logger: Logger;

    constructor() {
        super();
        this.logger = Logger.getInstance();
    }

    public sendAlert(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
        try {
            this.logger.info(`Sending ${level} alert: ${message}`);
            this.emit('alert', { level, message, timestamp: new Date().toISOString() });
        } catch (error) {
            this.logger.error('Error sending alert:', error);
        }
    }

    public sendTradeNotification(trade: any): void {
        try {
            this.logger.info('Trade notification:', trade);
            this.emit('tradeNotification', {
                ...trade,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            this.logger.error('Error sending trade notification:', error);
        }
    }
}
