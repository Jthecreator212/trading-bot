import { NotificationService } from './NotificationService';

export class TradingEngine extends EventEmitter {
    // ... existing properties ...
    private notificationService: NotificationService;

    private constructor() {
        super();
        this.components = new Map();
        this.initializeComponents();
        this.setupEventHandlers();
    }

    private initializeComponents(): void {
        // ... existing initializations ...
        this.notificationService = new NotificationService();
        this.register('notificationService', this.notificationService);
    }

    private setupEventHandlers(): void {
        // Existing monitoring handlers
        this.monitoringService.on('metrics', (metrics) => {
            this.logger.info('System metrics update:', metrics);
        });

        // WebSocket event handlers
        this.wsManager.on('error', (symbol: string, error: Error) => {
            this.notificationService.sendAlert(
                `WebSocket error for ${symbol}: ${error.message}`,
                'error'
            );
        });

        this.wsManager.on('connected', (symbol: string) => {
            this.notificationService.sendAlert(
                `WebSocket connected for ${symbol}`,
                'info'
            );
        });

        // Performance tracking notifications
        this.performanceTracker.on('performanceUpdate', (metrics: any) => {
            if (metrics.profitLoss < -1000) { // Example threshold
                this.notificationService.sendAlert(
                    `High loss detected: ${metrics.profitLoss}`,
                    'warning'
                );
            }
        });

        // Risk management notifications
        this.riskManager.on('riskThresholdBreached', (data: any) => {
            this.notificationService.sendAlert(
                `Risk threshold breached: ${data.message}`,
                'error'
            );
        });
    }

    public start(): void {
        try {
            this.isRunning = true;
            this.monitoringService.startMonitoring();
            const wsUrl = process.env.WEBSOCKET_URL || 'wss://stream.binance.com:9443/ws';
            this.wsManager.connect(wsUrl, 'yourSymbol');
            this.notificationService.sendAlert('Trading Engine started', 'info');
            this.logger.info('Trading Engine started');
            this.emit('engineStart');
        } catch (error) {
            this.logger.error('Failed to start Trading Engine:', error);
            this.notificationService.sendAlert(
                `Failed to start Trading Engine: ${error.message}`,
                'error'
            );
            this.stop();
        }
    }

    public stop(): void {
        try {
            this.isRunning = false;
            this.monitoringService.stopMonitoring();
            this.wsManager.disconnect();
            this.notificationService.sendAlert('Trading Engine stopped', 'info');
            this.logger.info('Trading Engine stopped');
            this.emit('engineStop');
        } catch (error) {
            this.logger.error('Error stopping Trading Engine:', error);
            this.notificationService.sendAlert(
                `Error stopping Trading Engine: ${error.message}`,
                'error'
            );
        }
    }
}
