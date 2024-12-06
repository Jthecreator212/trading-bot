import { MarketData, MLSignal, MarketRegime, TradingSignal } from '../types';
import { MarketDataAgent } from '../agents/market/MarketDataAgent';
import { DataManager } from './DataManager';
import { RiskManager } from './RiskManager';
import { MLSignalGenerator } from './ml/MLSignalGenerator';
import { MarketRegimeAnalyzer } from './analysis/MarketRegimeAnalyzer';
import { Logger } from './Logger';
import { Config } from './config/Config';
import { strategies, StrategyType } from '../strategies';
import { TrendFollowingStrategy } from '../strategies/trendFollowing';

export class Engine {
    private components: Map<string, any> = new Map();
    private strategies: Map<StrategyType, any> = new Map();
    private marketDataAgent: MarketDataAgent;
    private dataManager: DataManager;
    private riskManager: RiskManager;
    private mlSignalGenerator: MLSignalGenerator;
    private regimeAnalyzer: MarketRegimeAnalyzer;

    constructor() {
        this.initializeComponents();
        this.initializeStrategies();
    }

    private initializeComponents(): void {
        // Initialize logger first
        const logger = new Logger();
        this.components.set('logger', logger);
        logger.info('Registered component: logger');

        // Initialize config with proper instantiation
        const config = new Config();
        this.components.set('config', config);
        logger.info('Registered component: config');

        // Initialize other components
        const components = [
            ['riskManager', new RiskManager()],
            ['positionManager', {}],
            ['marketDepth', {}],
            ['tradeLogger', {}],
            ['wsManager', {}],
            ['performanceTracker', {}],
            ['notificationService', {}],
            ['dataManager', new DataManager()],
            ['regimeAnalyzer', new MarketRegimeAnalyzer()],
            ['mlSignalGenerator', new MLSignalGenerator()],
            ['marketDataAgent', new MarketDataAgent()]
        ];

        components.forEach(([name, component]) => {
            this.components.set(name as string, component);
            logger.info(`Registered component: ${name}`);
        });

        // Store references for frequently accessed components
        this.marketDataAgent = this.components.get('marketDataAgent');
        this.dataManager = this.components.get('dataManager');
        this.riskManager = this.components.get('riskManager');
        this.mlSignalGenerator = this.components.get('mlSignalGenerator');
        this.regimeAnalyzer = this.components.get('regimeAnalyzer');
    }

    private initializeStrategies(): void {
        this.strategies.set(
            StrategyType.TREND_FOLLOWING,
            new TrendFollowingStrategy(strategies[StrategyType.TREND_FOLLOWING].config)
        );
    }

    private setupEventHandlers(): void {
        const logger = this.components.get('logger');

        this.marketDataAgent.on('marketData', async (data) => {
            try {
                // Store and process market data
                this.dataManager.storeMarketData(data.symbol, data);
                this.components.get('marketDepth').update(data);
                this.components.get('tradeLogger').logMarketData(data);

                // Get recent data for analysis
                const recentData = this.dataManager.getRecentData(data.symbol, 50);
                
                if (!recentData || recentData.length === 0) {
                    logger.warn('No recent data available for analysis');
                    return;
                }

                // Analyze market regime
                const marketRegime = this.regimeAnalyzer.analyzeMarketConditions(recentData);

                // Process strategies
                await this.processStrategies(recentData);

                // Generate ML signals
                try {
                    const mlSignal = await this.mlSignalGenerator.generateSignals(recentData);

                    // Log analysis results
                    logger.info('Market Analysis:', {
                        regime: marketRegime ? {
                            type: marketRegime.regime,
                            confidence: `${marketRegime.confidence}%`,
                            recommendations: marketRegime.recommendations || []
                        } : 'No regime data',
                        mlSignal: mlSignal ? {
                            action: mlSignal.type,
                            confidence: `${(mlSignal.confidence * 100).toFixed(2)}%`
                        } : 'No ML signal',
                        currentPrice: data.price,
                        volume24h: data.volume
                    });

                    // Process ML signals if confidence is high
                    if (mlSignal && mlSignal.confidence > 0.8) {
                        await this.processMLSignal(mlSignal, marketRegime);
                    }
                } catch (mlError) {
                    logger.error('Error generating ML signals:', mlError);
                }

            } catch (error) {
                logger.error('Error processing market data:', {
                    error: error.message,
                    data: {
                        symbol: data.symbol,
                        price: data.price,
                        timestamp: data.timestamp
                    }
                });
            }
        });
    }

    private async processMLSignal(mlSignal: MLSignal, marketRegime: MarketRegime): Promise<void> {
        const logger = this.components.get('logger');
        const positionManager = this.components.get('positionManager');
        const config = this.components.get('config');

        try {
            if (mlSignal.confidence > 0.8 && marketRegime.confidence > 0.7) {
                const tradingSignal = {
                    type: mlSignal.type,
                    symbol: config.get('tradingPair'),
                    price: this.dataManager.getLatestData(config.get('tradingPair'))?.price || 0,
                    confidence: mlSignal.confidence,
                    timestamp: Date.now(),
                    source: 'ML'
                };

                await positionManager.handleMLSignal(tradingSignal, marketRegime);
                logger.info('ML Signal Processed:', {
                    signal: tradingSignal,
                    regime: marketRegime
                });
            }
        } catch (error) {
            logger.error('Error processing ML signal:', {
                error: error.message,
                signal: mlSignal,
                regime: marketRegime
            });
        }
    }

    private async processSignal(signal: TradingSignal): Promise<void> {
        const logger = this.components.get('logger');
        try {
            if (this.riskManager.assessRisk(signal, {})) {
                await this.components.get('positionManager').handleSignal(signal);
                logger.info('Trading signal processed:', signal);
            }
        } catch (error) {
            logger.error('Error processing trading signal:', {
                error: error.message,
                signal
            });
        }
    }

    private async processStrategies(marketData: MarketData[]): Promise<void> {
        for (const [type, strategy] of this.strategies) {
            const signal = strategy.analyze(marketData);
            if (signal) {
                await this.processSignal(signal);
            }
        }
    }

    public async start(): Promise<void> {
        const logger = this.components.get('logger');
        const config = this.components.get('config');
        
        try {
            logger.info('Trading Bot Starting...');

            // Initialize risk parameters
            const riskParams = config.get('riskParameters');
            this.riskManager.updateParameters(riskParams);
            logger.info('Risk parameters updated:', [riskParams]);

            // Start monitoring
            logger.info('Starting monitoring service');
            this.setupEventHandlers();

            // Connect to market data
            const tradingPair = config.get('tradingPair');
            logger.info(`Connecting to WebSocket for ${tradingPair}`);
            await this.marketDataAgent.connect(tradingPair);

            logger.info('Trading Engine started');
        } catch (error) {
            logger.error('Error starting trading engine:', error);
            throw error;
        }
    }

    public getComponent(name: string): any {
        return this.components.get(name);
    }
}

export default Engine;
