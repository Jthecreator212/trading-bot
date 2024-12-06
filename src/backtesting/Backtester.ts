import { BreakoutStrategy } from '../strategies/BreakoutStrategy';
import { DataManager } from '../core/DataManager';

export class Backtester {
    private strategy: BreakoutStrategy;
    private dataManager: DataManager;
    private initialBalance: number;
    private currentBalance: number;
    private trades: any[];

    constructor(strategy: BreakoutStrategy, initialBalance: number = 10000) {
        this.strategy = strategy;
        this.dataManager = new DataManager();
        this.initialBalance = initialBalance;
        this.currentBalance = initialBalance;
        this.trades = [];
    }

    private calculatePositionSize(signal: any) {
        const risk = Math.abs(signal.entry - signal.stopLoss);
        const riskAmount = this.currentBalance * 0.02; // 2% risk per trade
        return riskAmount / risk;
    }

    private async executeTrade(signal: any) {
        const trade = {
            type: signal.type,
            entry: signal.entry,
            stopLoss: signal.stopLoss,
            timestamp: Date.now(),
            size: this.calculatePositionSize(signal)
        };

        const exitPrice = signal.type === 'LONG' ? 
            signal.entry * 1.02 : // 2% profit for testing
            signal.entry * 0.98;  // 2% profit for short

        const pnl = (exitPrice - signal.entry) * trade.size;
        this.currentBalance += pnl;

        return {
            ...trade,
            exitPrice,
            pnl
        };
    }

    async runBacktest(startDate: string, endDate: string) {
        try {
            const historicalData = await this.dataManager.fetchHistoricalData({
                symbol: 'BTCUSDT',
                interval: '1h',
                startDate,
                endDate
            });

            for (let i = 100; i < historicalData.length; i++) {
                const windowData = historicalData.slice(0, i + 1);
                const signal = await this.strategy.analyze(windowData);

                if (signal.type !== 'NONE') {
                    const trade = await this.executeTrade(signal);
                    this.trades.push(trade);
                }
            }

            return this.generateReport();
        } catch (error) {
            console.error('Backtest error:', error);
            throw error;
        }
    }

    private generateReport() {
        const totalTrades = this.trades.length;
        const winningTrades = this.trades.filter(t => t.pnl > 0).length;
        const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
        const totalReturn = ((this.currentBalance - this.initialBalance) / this.initialBalance) * 100;

        return {
            totalTrades,
            winningTrades,
            winRate,
            totalReturn,
            finalBalance: this.currentBalance,
            trades: this.trades
        };
    }
}
