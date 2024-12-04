import { Logger } from './Logger';

export enum AlertLevel {
    INFO = 'INFO',
    WARNING = 'WARNING',
    DANGER = 'DANGER',
    CRITICAL = 'CRITICAL'
}

interface Alert {
    id: string;
    level: AlertLevel;
    message: string;
    timestamp: number;
    symbol?: string;
    data?: any;
}

interface AlertSubscriber {
    callback: (alert: Alert) => void;
    levels: AlertLevel[];
}

export class AlertSystem {
    private static instance: AlertSystem;
    private logger: Logger;
    private alerts: Alert[];
    private subscribers: Map<string, AlertSubscriber>;
    private maxAlerts: number;

    private constructor() {
        this.logger = Logger.getInstance();
        this.alerts = [];
        this.subscribers = new Map();
        this.maxAlerts = 1000; // Store last 1000 alerts
    }

    static getInstance(): AlertSystem {
        if (!AlertSystem.instance) {
            AlertSystem.instance = new AlertSystem();
        }
        return AlertSystem.instance;
    }

    sendAlert(level: AlertLevel, message: string, symbol?: string, data?: any): void {
        const alert: Alert = {
            id: `ALERT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            level,
            message,
            timestamp: Date.now(),
            symbol,
            data
        };

        this.alerts.push(alert);
        this.trimAlerts();
        this.notifySubscribers(alert);
        this.logAlert(alert);
    }

    subscribe(id: string, callback: (alert: Alert) => void, levels: AlertLevel[] = Object.values(AlertLevel)): void {
        this.subscribers.set(id, { callback, levels });
        this.logger.info(`New alert subscriber registered: ${id}`);
    }

    unsubscribe(id: string): void {
        this.subscribers.delete(id);
        this.logger.info(`Alert subscriber removed: ${id}`);
    }

    getAlerts(
        options: {
            level?: AlertLevel;
            symbol?: string;
            startTime?: number;
            endTime?: number;
        } = {}
    ): Alert[] {
        let filteredAlerts = this.alerts;

        if (options.level) {
            filteredAlerts = filteredAlerts.filter(alert => alert.level === options.level);
        }

        if (options.symbol) {
            filteredAlerts = filteredAlerts.filter(alert => alert.symbol === options.symbol);
        }

        if (options.startTime) {
            filteredAlerts = filteredAlerts.filter(alert => alert.timestamp >= options.startTime!);
        }

        if (options.endTime) {
            filteredAlerts = filteredAlerts.filter(alert => alert.timestamp <= options.endTime!);
        }

        return filteredAlerts;
    }

    clearAlerts(): void {
        this.alerts = [];
        this.logger.info('All alerts cleared');
    }

    private notifySubscribers(alert: Alert): void {
        for (const subscriber of this.subscribers.values()) {
            if (subscriber.levels.includes(alert.level)) {
                try {
                    subscriber.callback(alert);
                } catch (error) {
                    this.logger.error('Error notifying alert subscriber:', error as Error);
                }
            }
        }
    }

    private logAlert(alert: Alert): void {
        const logMessage = `[${alert.level}] ${alert.message}`;
        
        switch (alert.level) {
            case AlertLevel.INFO:
                this.logger.info(logMessage, alert.data);
                break;
            case AlertLevel.WARNING:
                this.logger.warn(logMessage, alert.data);
                break;
            case AlertLevel.DANGER:
            case AlertLevel.CRITICAL:
                this.logger.error(logMessage, alert.data);
                break;
        }
    }

    private trimAlerts(): void {
        if (this.alerts.length > this.maxAlerts) {
            this.alerts = this.alerts.slice(-this.maxAlerts);
        }
    }
}
