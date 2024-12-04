import { Logger } from './Logger';

interface SimulatedTrade {
    symbol: string;
    entryPrice: number;
    exitPrice: number;
    quantity: number;
    side: 'LONG' | 'SHORT';
    entryTime: Date;
    exitTime: Date;
    pnl: number;
    fees: number;
}

export class TradeSimulator {
    private logger: Logger;
    private balance: number;
    private trades: SimulatedTrade[];
    private fees: {
        maker: number;
        taker: number;
    };

    constructor(initialBalance: number = 10000, fees: { maker: number; taker: number } = { maker: 0.001, taker: 0.001 }) {
        this.logger = Logger.getInstance();
        this.balance = initialBalance;
        this.trades = [];
        this.fees = fees;
    }

    simulateTrade(symbol: string, entryPrice: number, exitPrice: number, quantity: number, side: 'LONG' | 'SHORT'): void {
        const entryTime = new Date();
        const exitTime = new Date(entryTime.getTime() + 60000); // Simulate 1-minute trade duration

        const pnl = this.calculatePnL(entryPrice, exitPrice, quantity
