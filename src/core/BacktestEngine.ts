import { Logger } from './Logger';
import { BaseStrategy } from '../strategies/BaseStrategy';
import { BaseProvider } from '../providers/BaseProvider';
import { MarketData } from '../providers/BaseProvider';

interface BacktestResult {
    symbol: string;
    startTime: number;
    endTime: number;
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    totalPnL: number;
    winRate: number;
    maxDrawdown: number;
    sharpeRatio: number;
    trades: BacktestTrade[];
}

interface BacktestTrade {
    symbol: string;
    entryTime: number;
    exitTime: number;
    entryPrice: number;
    exitPrice: number;
    side: 'LONG' | 'SHORT';
    quantity: number;
    pnl: number;
}

export class BacktestEngine {
    private logger: Logger;
    private strategy: BaseStrategy;
    private provider: BaseProvider;
    private trades: BacktestTrade[];
    private balance: number;
    private initialBalance: number;

    constructor(strategy: BaseStrategy, provider: BaseProvider, initialBalance: number = 10000) {
        this.logger = Logger.getInstance();
        this.strategy = strategy;
        this.provider = provider;
        this.trades = [];
        this.balance = initialBalance;
        this.initialBalance = initialBalance;
    }

    async run(startTime: number, endTime: number): Promise<BacktestResult> {
        this.logger.info(`Starting backtest for ${this.strategy.getSymbol()} from ${new Date(startTime)} to ${new Date(endTime)}`);

        try {
            const historicalData = await this.loadHistoricalData(startTime, endTime);
            return await this.simulateTrades(historicalData);
        } catch (error) {
            this.logger.error('Backtest error:', error as Error);
            throw error;
        }
    }

    private async loadHistoricalData(startTime: number, endTime: number): Promise<MarketData[]> {
        const interval = this.strategy.getInterval();
        const symbol = this.strategy.getSymbol();
        
        return await this.provider.getHistoricalData(symbol, interval.toString(), 1000);
    }

    private async simulateTrades(data: MarketData[]): Promise<BacktestResult> {
        let maxBalance = this.initialBalance;
        let minBalance = this.initialBalance;
        let position: BacktestTrade | null = null;

        for (const candle of data) {
            const signal = await this.strategy.analyze(candle);

            if (signal === 'BUY' && !position) {
                position = this.openPosition('LONG', candle);
            } else if (signal === 'SELL' && position) {
                this.closePosition(position, candle);
                position = null;
            }

            // Track drawdown
            if (this.balance > maxBalance) maxBalance = this.balance;
            if (this.balance < minBalance) minBalance = this.balance;
        }

        // Close any remaining position
        if (position) {
            this.closePosition(position, data[data.length - 1]);
        }

        return this.generateResults(data[0].timestamp, data[data.length - 1].timestamp, maxBalance, minBalance);
    }

    private openPosition(side: 'LONG' | 'SHORT', data: MarketData): BacktestTrade {
        const quantity = this.calculatePositionSize(data.price);
        
        return {
            symbol: data.symbol,
            entryTime: data.timestamp,
            exitTime: 0,
            entryPrice: data.price,
            exitPrice: 0,
            side,
            quantity,
            pnl: 0
        };
    }

    private closePosition(position: BacktestTrade, data: MarketData): void {
        position.exitTime = data.timestamp;
        position.exitPrice = data.price;
        
        const pnl = this.calculatePnL(position, data.price);
        position.pnl = pnl;
        this.balance += pnl;

        this.trades.push(position);
        this.logger.info(`Closed position: PnL = ${pnl.toFixed(2)}`);
    }

    private calculatePnL(position: BacktestTrade, currentPrice: number): number {
        const multiplier = position.side === 'LONG' ? 1 : -1;
        return (currentPrice - position.entryPrice) * position.quantity * multiplier;
    }

    private calculatePositionSize(price: number): number {
        return (this.balance * 0.1) / price; // Use 10% of balance per trade
    }

    private generateResults(startTime: number, endTime: number, maxBalance: number, minBalance: number): BacktestResult {
        const winningTrades = this.trades.filter(t => t.pnl > 0).length;
        const totalPnL = this.trades.reduce((sum, trade) => sum + trade.pnl, 0);
        const maxDrawdown = ((maxBalance - minBalance) / maxBalance) * 100;
        const returns = this.calculateReturns();
        const sharpeRatio = this.calculateSharpeRatio(returns);

        return {
            symbol: this.strategy.getSymbol(),
            startTime,
            endTime,
            totalTrades: this.trades.length,
            winningTrades,
            losingTrades: this.trades.length - winningTrades,
            totalPnL,
            winRate: (winningTrades / this.trades.length) * 100,
            maxDrawdown,
            sharpeRatio,
            trades: this.trades
        };
    }

    private calculateReturns(): number[] {
        return this.trades.map(trade => trade.pnl / this.initialBalance);
    }

    private calculateSharpeRatio(returns: number[]): number {
        if (returns.length === 0) return 0;

        const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
        const stdDev = Math.sqrt(
            returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length
        );

        return stdDev === 0 ? 0 : (avgReturn / stdDev) * Math.sqrt(365); // Annualized
    }
}
