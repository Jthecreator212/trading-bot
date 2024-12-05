import { EventEmitter } from 'events';
import { Logger } from './Logger';
import { DataManager } from './DataManager';
import { PerformanceTracker } from './PerformanceTracker';
import { BaseStrategy } from '../strategies/BaseStrategy';

export class BacktestEngine extends EventEmitter {
    private logger: Logger;
    private dataManager: DataManager;
    private performanceTracker: PerformanceTracker;
    private strategies: Map<string, BaseStrategy>;
    private historicalData: Map<string, any[]>;

    constructor() {
        super();
        this.logger = new Logger();
        this.dataManager = new DataManager();
        this.performanceTracker = new PerformanceTracker();
        this.strategies = new Map();
        this.historicalData = new Map();
    }

    public async loadHistoricalData(symbol: string, startTime: number, endTime: number): Promise<void> {
        try {
            const data = await this.dataManager.getHistoricalData(symbol, startTime, endTime);
            this.historicalData.set(symbol, data);
            this.logger.info(`Loaded historical data for ${symbol}`);
        } catch (error) {
            this.logger.error(`Failed to load historical data for ${symbol}: ${error.message}`);
        }
    }

    public registerStrategy(strategy: BaseStrategy): void {
        this.strategies.set(strategy.getSymbol(), strategy);
    }

    public async runBacktest(): Promise<void> {
        this.logger.info('Starting backtest...');
        
        for (const [symbol, data] of this.historicalData) {
            const strategy = this.strategies.get(symbol);
            if (!strategy) continue;

            for (const candle of data) {
                await strategy.analyze(candle);
                this.performanceTracker.updateMetrics(symbol, candle);
            }
        }

        const results = this.performanceTracker.getResults();
        this.logger.info('Backtest completed', results);
        this.emit('backtestComplete', results);
    }
}
