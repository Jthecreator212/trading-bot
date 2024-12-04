import { Logger } from './Logger';

interface TradeMetrics {
    symbol: string;
    entryPrice: number;
    exitPrice: number;
    quantity: number;
    side: 'LONG' | 'SHORT';
    pnl: number;
    timestamp: number;
    duration: number;
}

interface SymbolMetrics {
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    totalPnL: number;
    averagePnL: number;
    winRate: number;
    averageDuration: number;
    bestTrade: TradeMetrics;
    worstTrade: TradeMetrics;
}

export class TradingAnalytics {
    private static instance: TradingAnalytics;
    private logger: Logger;
    private trades: Map<string, TradeMetrics[]>;
    private metrics: Map<string, SymbolMetrics>;
    private updateInterval: NodeJS.Timer | null;

    private constructor() {
        this.logger = Logger.getInstance();
        this.trades = new Map();
        this.metrics = new Map();
        this.updateInterval = null;
        this.startPeriodicUpdate();
    }

    static getInstance(): TradingAnalytics {
        if (!TradingAnalytics.instance) {
            TradingAnalytics.instance = new TradingAnalytics();
        }
        return TradingAnalytics.instance;
    }

    addTrade(trade: TradeMetrics): void {
        if (!this.trades.has(trade.symbol)) {
            this.trades.set(trade.symbol, []);
        }
        this.trades.get(trade.symbol)!.push(trade);
        this.updateMetrics(trade.symbol);
    }

    private updateMetrics(symbol: string): void {
        const trades = this.trades.get(symbol) || [];
        if (trades.length === 0) return;

        const winningTrades = trades.filter(t => t.pnl > 0);
        const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
        const averagePnL = totalPnL / trades.length;
        const averageDuration = trades.reduce((sum, t) => sum + t.duration, 0) / trades.length;

        const metrics: SymbolMetrics = {
            totalTrades: trades.length,
            winningTrades: winningTrades.length,
            losingTrades: trades.length - winningTrades.length,
            totalPnL,
            averagePnL,
            winRate: (winningTrades.length / trades.length) * 100,
            averageDuration,
            bestTrade: trades.reduce((best, t) => t.pnl > best.pnl ? t : best),
            worstTrade: trades.reduce((worst, t) => t.pnl < worst.pnl ? t : worst)
        };

        this.metrics.set(symbol, metrics);
    }

    private startPeriodicUpdate(): void {
        this.updateInterval = setInterval(() => {
            this.generateReport();
        }, 300000); // Update every 5 minutes
    }

    generateReport(): void {
        this.logger.info('Trading Analytics Report:');
        
        for (const [symbol, metrics] of this.metrics) {
            this.logger.info(`\nMetrics for ${symbol}:`);
            this.logger.info(`Total Trades: ${metrics.totalTrades}`);
            this.logger.info(`Win Rate: ${metrics.winRate.toFixed(2)}%`);
            this.logger.info(`Total PnL: ${metrics.totalPnL.toFixed(2)} USDT`);
            this.logger.info(`Average PnL: ${metrics.averagePnL.toFixed(2)} USDT`);
            this.logger.info(`Average Trade Duration: ${(metrics.averageDuration / 1000 / 60).toFixed(2)} minutes`);
            this.logger.info(`Best Trade: ${metrics.bestTrade.pnl.toFixed(2)} USDT`);
            this.logger.info(`Worst Trade: ${metrics.worstTrade.pnl.toFixed(2)} USDT`);
        }
    }

    getMetrics(symbol: string): SymbolMetrics | undefined {
        return this.metrics.get(symbol);
    }

    getAllMetrics(): Map<string, SymbolMetrics> {
        return this.metrics;
    }

    getTradeHistory(symbol: string): TradeMetrics[] {
        return this.trades.get(symbol) || [];
    }

    stop(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}
