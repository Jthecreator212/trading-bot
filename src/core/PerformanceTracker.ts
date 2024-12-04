import { Logger } from './Logger';

interface Trade {
    symbol: string;
    entryPrice: number;
    exitPrice: number;
    quantity: number;
    side: 'LONG' | 'SHORT';
    pnl: number;
    timestamp: number;
}

export class PerformanceTracker {
    private logger: Logger;
    private trades: Trade[];
    private initialBalance: number;
    private currentBalance: number;

    constructor(initialBalance: number = 10000) {
        this.logger = Logger.getInstance();
        this.trades = [];
        this.initialBalance = initialBalance;
        this.currentBalance = initialBalance;
    }

    logTrade(trade: Trade): void {
        this.trades.push(trade);
        this.currentBalance += trade.pnl;
        this.logger.info(`Logged trade for ${trade.symbol}: PnL = ${trade.pnl.toFixed(2)} USDT`);
    }

    generateReport(): void {
        const totalTrades = this.trades.length;
        const winningTrades = this.trades.filter(t => t.pnl > 0).length;
        const losingTrades = totalTrades - winningTrades;
        const winRate = (winningTrades / totalTrades) * 100;
        const totalPnL = this.trades.reduce((acc, trade) => acc + trade.pnl, 0);
        const returnOnInvestment = ((this.currentBalance - this.initialBalance) / this.initialBalance) * 100;

        this.logger.info('Performance Report:');
        this.logger.info(`Total Trades: ${totalTrades}`);
        this.logger.info(`Winning Trades: ${winningTrades}`);
        this.logger.info(`Losing Trades: ${losingTrades}`);
        this.logger.info(`Win Rate: ${winRate.toFixed(2)}%`);
        this.logger.info(`Total PnL: ${totalPnL.toFixed(2)} USDT`);
        this.logger.info(`Return on Investment: ${returnOnInvestment.toFixed(2)}%`);
    }

    getCurrentBalance(): number {
        return this.currentBalance;
    }

    getTradeHistory(): Trade[] {
        return this.trades;
    }
}
