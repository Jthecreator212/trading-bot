import { EventEmitter } from 'events';
import { Logger } from './Logger';
import { ConfigManager } from './ConfigManager';
import { RiskManager } from './RiskManager';
import { PositionManager } from './PositionManager';
import { MarketDepth } from './MarketDepth';
import { TradeLogger } from './TradeLogger';
import { WebSocketManager } from './WebSocketManager';
import { MarketSentimentAnalyzer } from './MarketSentimentAnalyzer';
import { PerformanceTracker } from './PerformanceTracker';
import { NotificationService } from './NotificationService';
import { MonitoringService } from '../monitoring/MonitoringService';

export class TradingEngine extends EventEmitter {
    private static instance: TradingEngine;
    private components: Map<string, any>;
    private logger: Logger;
    private config: ConfigManager;
    private riskManager: RiskManager;
    private positionManager: PositionManager;
    private marketDepth: MarketDepth;
    private tradeLogger: TradeLogger;
    private wsManager: WebSocketManager;
    private sentimentAnalyzer: MarketSentimentAnalyzer;
    private performanceTracker: PerformanceTracker;
    private notificationService: NotificationService;
    private monitoringService: MonitoringService;
    private isRunning: boolean = false;

    private constructor() {
        super();
        this.components = new Map();
        this.initializeComponents();
        this.setupEventHandlers();
    }

    private initializeComponents(): void {
        this.logger = Logger.getInstance();
        this.config = new ConfigManager();
        this.riskManager = new RiskManager();
        this.positionManager = new PositionManager();
        this.marketDepth = new MarketDepth();
        this.tradeLogger = new TradeLogger();
        this.wsManager = new WebSocketManager();
        this.sentimentAnalyzer = new MarketSentimentAnalyzer();
        this.performanceTracker = new PerformanceTracker();
        this.notificationService = new NotificationService();
        this.monitoringService = new MonitoringService();

        // Register core components
        this.register('logger', this.logger);
        this.register('config', this.config);
        this.register('riskManager', this.riskManager);
        this.register('positionManager', this.positionManager);
        this.register('marketDepth', this.marketDepth);
        this.register('tradeLogger', this.tradeLogger);
        this.register('wsManager', this.wsManager);
        this.register('sentimentAnalyzer', this.sentimentAnalyzer);
        this.register('performanceTracker', this.performanceTracker);
        this.register('notificationService', this.notificationService);
        this.register('monitoringService', this.monitoringService);
    }

    private setupEventHandlers(): void {
        this.monitoringService.on('metrics', (metrics) => {
            this.logger.info('System metrics update:', metrics);
        });

        this.performanceTracker.on('performanceUpdate', (metrics) => {
            this.monitoringService.trackMetric('performance', metrics);
        });
    }

    public static getInstance(): TradingEngine {
        if (!TradingEngine.instance) {
            TradingEngine.instance = new TradingEngine();
        }
        return TradingEngine.instance;
    }

    public register(name: string, component: any): void {
        this.components.set(name, component);
        this.logger.info(`Registered component: ${name}`);
    }

    public getComponent<T>(name: string): T {
        return this.components.get(name) as T;
    }

    public start(): void {
        try {
            this.isRunning = true;
            this.monitoringService.startMonitoring();
            const wsUrl = process.env.WEBSOCKET_URL || 'wss://stream.binance.com:9443/ws';
            this.wsManager.connect(wsUrl, 'yourSymbol');
            this.logger.info('Trading Engine started');
            this.emit('engineStart');
        } catch (error) {
            this.logger.error('Failed to start Trading Engine:', error);
            this.stop();
        }
    }

    public stop(): void {
        try {
            this.isRunning = false;
            this.monitoringService.stopMonitoring();
            this.wsManager.disconnect();
            this.logger.info('Trading Engine stopped');
            this.emit('engineStop');
        } catch (error) {
            this.logger.error('Error stopping Trading Engine:', error);
        }
    }

    public isEngineRunning(): boolean {
        return this.isRunning;
    }
}

export default TradingEngine;
