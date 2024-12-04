import { Logger } from './Logger';
import { BaseStrategy } from '../strategies/BaseStrategy';
import { ConfigManager } from './ConfigManager';
import { RiskManager } from './RiskManager';
import { PositionManager } from './PositionManager';
import { MarketDepth } from './MarketDepth';
import { AlertSystem, AlertLevel } from './AlertSystem';
import { TradeLogger } from './TradeLogger';
import { WebSocketManager } from './WebSocketManager';
import { MarketSentimentAnalyzer } from './MarketSentimentAnalyzer';
import { PerformanceTracker } from './PerformanceTracker';

export class TradingEngine {
    private logger: Logger;
    private config: ConfigManager;
    private riskManager: RiskManager;
    private positionManager: PositionManager;
    private marketDepth: MarketDepth;
    private alertSystem: AlertSystem;
    private tradeLogger: TradeLogger;
    private wsManager: WebSocketManager;
    private sentimentAnalyzer: MarketSentimentAnalyzer;
    private performanceTracker: PerformanceTracker;
    private strategies: Map<string, BaseStrategy>;
    private isRunning: boolean;

    constructor() {
        this.logger = Logger.getInstance();
        this.config = ConfigManager.getInstance();
        this.riskManager = RiskManager.getInstance();
        this.positionManager = new PositionManager();
        this.marketDepth = MarketDepth.getInstance();
        this.alertSystem = AlertSystem.getInstance();
        this.tradeLogger = TradeLogger.getInstance();
        this.wsManager = WebSocketManager.getInstance();
        this.sentimentAnalyzer = MarketSentimentAnalyzer.getInstance();
        this.performanceTracker = new PerformanceTracker();
        this.strategies = new Map();
        this.isRunning = false;
    }

    async start(): Promise<void> {
        try {
            this.logger.info('Starting Trading Engine...');
            this.isRunning = true;

            // Initialize WebSocket connections for each trading pair
            for (const strategy of this.strategies.values()) {
                const symbol = strategy.getSymbol();
                await this.wsManager.createConnection({
                    url: `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`,
                    symbol,
                    type: 'trades'
                });

                // Initialize market depth tracking
                await this.marketDepth.connectToSymbol(symbol);

                // Start sentiment analysis
                await this.sentimentAnalyzer.analyzeSentiment(symbol);
            }

            // Start strategy execution
            for (const strategy of this.strategies.values()) {
                this.executeStrategy(strategy);
            }

            // Start position monitoring
            this.startPositionMonitoring();

            this.alertSystem.sendAlert(AlertLevel.INFO, 'Trading Engine started successfully');
            this.logger.info('Trading Engine started successfully');

        } catch (error) {
            this.logger.error('Error starting Trading Engine:', error as Error);
            this.alertSystem.sendAlert(AlertLevel.CRITICAL, 'Failed to start Trading Engine');
            throw error;
        }
    }

    async stop(): Promise<void> {
        try {
            this.logger.info('Stopping Trading Engine...');
            this.isRunning = false;

            // Stop all WebSocket connections
            await this.wsManager.closeAllConnections();

            // Stop market depth tracking
            this.marketDepth.stop();

            // Stop sentiment analyzer
            this.sentimentAnalyzer.stop();

            // Generate final performance report
            this.performanceTracker.generateReport();

            this.alertSystem.sendAlert(AlertLevel.INFO, 'Trading Engine stopped successfully');
            this.logger.info('Trading Engine stopped successfully');

        } catch (error) {
            this.logger.error('Error stopping Trading Engine:', error as Error);
            this.alertSystem.sendAlert(AlertLevel.CRITICAL, 'Error stopping Trading Engine');
            throw error;
        }
    }

    addStrategy(strategy: BaseStrategy): void {
        this.strategies.set(strategy.getSymbol(), strategy);
        this.logger.info(`Added strategy for ${strategy.getSymbol()}`);
    }

    private async executeStrategy(strategy: BaseStrategy): Promise<void> {
        while (this.isRunning) {
            try {
                await strategy.execute();
                await this.sleep(strategy.getInterval());
            } catch (error) {
                this.logger.error(`Error executing strategy for ${strategy.getSymbol()}:`, error as Error);
                this.alertSystem.sendAlert(
                    AlertLevel.DANGER,
                    `Strategy execution error for ${strategy.getSymbol()}`
                );
            }
        }
    }

    private startPositionMonitoring(): void {
        setInterval(() => {
            if (!this.isRunning) return;

            try {
                const positions = this.positionManager.getOpenPositions();
                for (const position of positions) {
                    this.positionManager.updatePosition(position.symbol);
                }
            } catch (error) {
                this.logger.error('Error monitoring positions:', error as Error);
            }
        }, 1000); // Check positions every second
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
