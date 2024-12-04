import { BaseStrategy } from './BaseStrategy';
import { BinanceProvider } from '../providers/BinanceProvider';
import { RiskManager } from '../core/RiskManager';
import { PositionManager } from '../core/PositionManager';
import { Indicators } from '../utils/indicators';

interface StrategyConfig {
    rsiPeriod: number;
    smaPeriod: number;
    minVolume: number;
    positionManager: PositionManager;
    riskManager: RiskManager;
}

export class AdvancedStrategy extends BaseStrategy {
    private provider: BinanceProvider;
    private config: StrategyConfig;
    private prices: number[] = [];
    private lastRSI: number = 0;
    private lastSMA: number = 0;

    constructor(
        symbol: string,
        interval: number,
        provider: BinanceProvider,
        config: StrategyConfig
    ) {
        super(symbol, interval);
        this.provider = provider;
        this.config = config;
    }

    async execute(): Promise<void> {
        this.isRunning = true;
        this.logger.info(`Starting strategy execution for ${this.symbol}`);

        while (this.isRunning) {
            try {
                const marketData = await this.provider.getMarketData(this.symbol);
                this.prices.push(marketData.price);

                // Keep last 50 prices for analysis
                if (this.prices.length > 50) {
                    this.prices.shift();
                }

                // Wait for enough price data
                if (this.prices.length >= this.config.smaPeriod) {
                    await this.analyzeMarket(marketData.price);
                }

                await this.sleep(this.interval);
            } catch (error) {
                this.logger.error(`Error executing strategy: ${error}`, error as Error);
                await this.sleep(5000);
            }
        }
    }

    private async analyzeMarket(currentPrice: number): Promise<void> {
        // Calculate indicators
        this.lastRSI = Indicators.calculateRSI(this.prices, this.config.rsiPeriod);
        this.lastSMA = Indicators.calculateSMA(this.prices, this.config.smaPeriod);

        const position = this.config.positionManager.getPosition(this.symbol);

        // Log market analysis
        this.logger.info(`${this.symbol} Analysis - Price: ${currentPrice}, RSI: ${this.lastRSI.toFixed(2)}, SMA: ${this.lastSMA.toFixed(2)}`);

        // Trading logic
        if (!position) {
            // Check for entry conditions
            if (this.lastRSI < 30 && currentPrice > this.lastSMA) {
                // Bullish signal
                await this.enterLongPosition(currentPrice);
            } else if (this.lastRSI > 70 && currentPrice < this.lastSMA) {
                // Bearish signal
                await this.enterShortPosition(currentPrice);
            }
        } else {
            // Check exit conditions
            if (position.side === 'LONG' && (this.lastRSI > 70 || currentPrice < position.stopLoss)) {
                await this.exitPosition(currentPrice);
            } else if (position.side === 'SHORT' && (this.lastRSI < 30 || currentPrice > position.stopLoss)) {
                await this.exitPosition(currentPrice);
            }
        }
    }

    private async enterLongPosition(price: number): Promise<void> {
        const quantity = this.config.riskManager.calculatePositionSize(
            price,
            this.config.positionManager.getBalance()
        );

        if (quantity <= 0) return;

        const stopLoss = this.config.riskManager.calculateStopLoss(price, 'LONG');
        const takeProfit = this.config.riskManager.calculateTakeProfit(price, 'LONG');

        const success = this.config.positionManager.openPosition(
            this.symbol,
            'LONG',
            price,
            quantity,
            stopLoss,
            takeProfit
        );

        if (success) {
            this.logger.info(`Opened LONG position for ${this.symbol} at ${price}`);
        }
    }

    private async enterShortPosition(price: number): Promise<void> {
        const quantity = this.config.riskManager.calculatePositionSize(
            price,
            this.config.positionManager.getBalance()
        );

        if (quantity <= 0) return;

        const stopLoss = this.config.riskManager.calculateStopLoss(price, 'SHORT');
        const takeProfit = this.config.riskManager.calculateTakeProfit(price, 'SHORT');

        const success = this.config.positionManager.openPosition(
            this.symbol,
            'SHORT',
            price,
            quantity,
            stopLoss,
            takeProfit
        );

        if (success) {
            this.logger.info(`Opened SHORT position for ${this.symbol} at ${price}`);
        }
    }

    private async exitPosition(price: number): Promise<void> {
        const pnl = this.config.positionManager.closePosition(this.symbol, price);
        this.logger.info(`Closed position for ${this.symbol} at ${price}. PnL: ${pnl}`);
    }
}
