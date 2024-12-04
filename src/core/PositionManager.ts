import { Logger } from './Logger';

interface Position {
    symbol: string;
    entryPrice: number;
    quantity: number;
    side: 'LONG' | 'SHORT';
    stopLoss: number;
    takeProfit: number;
    timestamp: number;
    pnl: number;
}

export class PositionManager {
    private logger: Logger;
    private positions: Map<string, Position>;
    private balance: number;
    private maxPositions: number;

    constructor(initialBalance: number = 10000, maxPositions: number = 3) {
        this.logger = Logger.getInstance();
        this.positions = new Map();
        this.balance = initialBalance;
        this.maxPositions = maxPositions;
    }

    openPosition(symbol: string, side: 'LONG' | 'SHORT', price: number, quantity: number, stopLoss: number, takeProfit: number): boolean {
        if (this.positions.size >= this.maxPositions) {
            this.logger.warn(`Cannot open position: Maximum positions (${this.maxPositions}) reached`);
            return false;
        }

        if (this.positions.has(symbol)) {
            this.logger.warn(`Position already exists for ${symbol}`);
            return false;
        }

        const position: Position = {
            symbol,
            side,
            entryPrice: price,
            quantity,
            stopLoss,
            takeProfit,
            timestamp: Date.now(),
            pnl: 0
        };

        this.positions.set(symbol, position);
        this.logger.info(`Opened ${side} position for ${symbol} at ${price}`);
        return true;
    }

    closePosition(symbol: string, exitPrice: number): number {
        const position = this.positions.get(symbol);
        if (!position) {
            this.logger.warn(`No position found for ${symbol}`);
            return 0;
        }

        const pnl = this.calculatePnL(position, exitPrice);
        this.balance += pnl;
        this.positions.delete(symbol);

        this.logger.info(`Closed position for ${symbol}. PnL: ${pnl.toFixed(2)} USDT`);
        return pnl;
    }

    updatePositions(currentPrices: Map<string, number>): void {
        for (const [symbol, position] of this.positions) {
            const currentPrice = currentPrices.get(symbol);
            if (!currentPrice) continue;

            // Check stop loss
            if (position.side === 'LONG' && currentPrice <= position.stopLoss) {
                this.closePosition(symbol, currentPrice);
                this.logger.warn(`Stop loss triggered for ${symbol}`);
            }
            else if (position.side === 'SHORT' && currentPrice >= position.stopLoss) {
                this.closePosition(symbol, currentPrice);
                this.logger.warn(`Stop loss triggered for ${symbol}`);
            }

            // Check take profit
            if (position.side === 'LONG' && currentPrice >= position.takeProfit) {
                this.closePosition(symbol, currentPrice);
                this.logger.info(`Take profit reached for ${symbol}`);
            }
            else if (position.side === 'SHORT' && currentPrice <= position.takeProfit) {
                this.closePosition(symbol, currentPrice);
                this.logger.info(`Take profit reached for ${symbol}`);
            }
        }
    }

    private calculatePnL(position: Position, currentPrice: number): number {
        const multiplier = position.side === 'LONG' ? 1 : -1;
        return ((currentPrice - position.entryPrice) * position.quantity) * multiplier;
    }

    getPosition(symbol: string): Position | undefined {
        return this.positions.get(symbol);
    }

    getOpenPositions(): Position[] {
        return Array.from(this.positions.values());
    }

    getBalance(): number {
        return this.balance;
    }
}
