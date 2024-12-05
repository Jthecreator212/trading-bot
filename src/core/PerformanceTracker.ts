import { EventEmitter } from 'events';
import { Logger } from './Logger';

interface TradeMetrics {
    symbol: string;
    profit: number;
    winRate: number;
    totalTrades: number;
    successfulTrades: number;
    failedTrades: number;
    averageProfit: number;
    maxDrawdown: number;
    timestamp: number;
}

export class PerformanceTracker extends EventEmitter {
    private logger: Logger;
    private metrics: Map<string, TradeMetrics>;
    private historicalMetrics: Map<string, TradeMetrics[]>;

    constructor() {
        super();
        this.logger = new Logger();
        this.metrics = new Map();
        this.historicalMetrics = new Map();
    }

    public updateMetrics(symbol: string, tradeResult: any): void {
        const currentMetrics = this.getOrCreateMetrics(symbol);
        
        // Update metrics based on trade result
        currentMetrics.totalTrades++;
        if (tradeResult.profit > 0) {
            currentMetrics.successfulTrades++;
            currentMetrics.profit += tradeResult.profit;
        } else {
            currentMetrics.failedTrades++;
            currentMetrics.profit += tradeResult.profit;
        }

        // Calculate derived metrics
        currentMetrics.winRate = (currentMetrics.successfulTrades / currentMetrics.totalTrades) * 100;
        currentMetrics.averageProfit = currentMetrics.profit / currentMetrics.totalTrades;
        currentMetrics.timestamp = Date.now();

        // Update historical metrics
        this.updateHistoricalMetrics(symbol, currentMetrics);

        // Emit metrics update event
        this.emit('metricsUpdate', { symbol, metrics: currentMetrics });
        this.logger.info(`Updated performance metrics for ${symbol}`);
    }

    private getOrCreateMetrics(symbol: string): TradeMetrics {
        if (!this.metrics.has(symbol)) {
            this.metrics.set(symbol, {
                symbol,
                profit: 0,
                winRate: 0,
                totalTrades: 0,
                successfulTrades: 0,
                failedTrades: 0,
                averageProfit: 0,
                maxDrawdown: 0,
                timestamp: Date.now()
            });
        }
        return this.metrics.get(symbol)!;
    }

    private updateHistoricalMetrics(symbol: string, currentMetrics: TradeMetrics): void {
        if (!this.historicalMetrics.has(symbol)) {
            this.historicalMetrics.set(symbol, []);
        }
        this.historicalMetrics.get(symbol)!.push({ ...currentMetrics });
    }

    public getMetrics(symbol: string): TradeMetrics | undefined {
        return this.metrics.get(symbol);
    }

    public getAllMetrics(): Map<string, TradeMetrics> {
        return new Map(this.metrics);
    }

    public getHistoricalMetrics(symbol: string): TradeMetrics[] {
        return this.historicalMetrics.get(symbol) || [];
    }

    public calculateDrawdown(symbol: string): number {
        const history = this.getHistoricalMetrics(symbol);
        if (history.length === 0) return 0;

        let peak = -Infinity;
        let maxDrawdown = 0;

        history.forEach(metric => {
            if (metric.profit > peak) {
                peak = metric.profit;
            }
            const drawdown = ((peak - metric.profit) / peak) * 100;
            maxDrawdown = Math.max(maxDrawdown, drawdown);
        });

        return maxDrawdown;
    }
}
