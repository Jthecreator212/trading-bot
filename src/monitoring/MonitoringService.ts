import { Logger } from '../core/Logger';
import { EventEmitter } from 'events';

export class MonitoringService extends EventEmitter {
    private logger: Logger;
    private metrics: Map<string, any>;
    private monitoringInterval: NodeJS.Timeout | null = null;

    constructor() {
        super();
        this.logger = Logger.getInstance();
        this.metrics = new Map();
    }

    public startMonitoring(): void {
        this.logger.info('Starting monitoring service');
        this.monitoringInterval = setInterval(() => {
            this.trackSystemMetrics();
        }, 1000); // Adjusted to 1 second for testing purposes
    }

    public stopMonitoring(): void {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
            this.logger.info('Monitoring service stopped');
        }
    }

    private trackSystemMetrics(): void {
        try {
            const metrics = {
                memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
                uptime: process.uptime(),
                timestamp: new Date().toISOString()
            };
            
            this.metrics.set('system', metrics);
            this.emit('metrics', metrics);
            this.logger.info('System metrics tracked:', metrics);
        } catch (error) {
            this.logger.error('Error tracking system metrics:', error);
        }
    }

    public getMetrics(): Map<string, any> {
        return new Map(this.metrics);
    }
}
