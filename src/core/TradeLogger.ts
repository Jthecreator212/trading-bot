import { Logger } from './Logger';
import * as fs from 'fs/promises';
import * as path from 'path';

interface TradeLogEntry {
    symbol: string;
    entryPrice: number;
    exitPrice: number;
    quantity: number;
    side: 'LONG' | 'SHORT';
    entryTime: Date;
    exitTime: Date;
    pnl: number;
    fees: number;
    strategy: string;
}

export class TradeLogger {
    private static instance: TradeLogger;
    private logger: Logger;
    private logDir: string;
    private tradeLogs: Map<string, TradeLogEntry[]>;

    private constructor() {
        this.logger = Logger.getInstance();
        this.logDir = path.join(process.cwd(), 'trade_logs');
        this.tradeLogs = new Map();
        this.initializeLogDirectory();
    }

    static getInstance(): TradeLogger {
        if (!TradeLogger.instance) {
            TradeLogger.instance = new TradeLogger();
        }
        return TradeLogger.instance;
    }

    private async initializeLogDirectory(): Promise<void> {
        try {
            await fs.mkdir(this.logDir, { recursive: true });
            this.logger.info('Trade log directory initialized');
        } catch (error) {
            this.logger.error('Error initializing trade log directory:', error as Error);
        }
    }

    async logTrade(trade: TradeLogEntry): Promise<void> {
        if (!this.tradeLogs.has(trade.symbol)) {
            this.tradeLogs.set(trade.symbol, []);
        }

        const logs = this.tradeLogs.get(trade.symbol)!;
        logs.push(trade);

        // Write to file
        await this.writeLogToFile(trade.symbol, trade);
    }

    private async writeLogToFile(symbol: string, trade: TradeLogEntry): Promise<void> {
        try {
            const filename = path.join(this.logDir, `${symbol}_trades.json`);
            const existingData = await this.readJsonFile(filename);
            existingData.push(trade);

            await fs.writeFile(filename, JSON.stringify(existingData, null, 2));
            this.logger.info(`Logged trade for ${symbol}`);
        } catch (error) {
            this.logger.error(`Error writing trade log for ${symbol}:`, error as Error);
        }
    }

    private async readJsonFile(filename: string): Promise<any[]> {
        try {
            const data = await fs.readFile(filename, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    }

    getTradeLogs(symbol: string): TradeLogEntry[] {
        return this.tradeLogs.get(symbol) || [];
    }

    async getTradeLogsFromFile(symbol: string): Promise<TradeLogEntry[]> {
        const filename = path.join(this.logDir, `${symbol}_trades.json`);
        return await this.readJsonFile(filename);
    }
}
