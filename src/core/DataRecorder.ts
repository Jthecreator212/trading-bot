import { Logger } from './Logger';
import * as fs from 'fs/promises';
import * as path from 'path';

interface TradeRecord {
    symbol: string;
    price: number;
    quantity: number;
    side: 'BUY' | 'SELL';
    timestamp: number;
    pnl?: number;
}

interface PriceRecord {
    symbol: string;
    price: number;
    volume: number;
    timestamp: number;
}

export class DataRecorder {
    private static instance: DataRecorder;
    private logger: Logger;
    private dataDir: string;
    private priceCache: Map<string, PriceRecord[]>;
    private tradeCache: Map<string, TradeRecord[]>;
    private maxCacheSize: number;

    private constructor() {
        this.logger = Logger.getInstance();
        this.dataDir = path.join(process.cwd(), 'data');
        this.priceCache = new Map();
        this.tradeCache = new Map();
        this.maxCacheSize = 10000; // Maximum records per symbol
        this.initializeDataDirectory();
    }

    static getInstance(): DataRecorder {
        if (!DataRecorder.instance) {
            DataRecorder.instance = new DataRecorder();
        }
        return DataRecorder.instance;
    }

    private async initializeDataDirectory(): Promise<void> {
        try {
            await fs.mkdir(this.dataDir, { recursive: true });
            this.logger.info('Data directory initialized');
        } catch (error) {
            this.logger.error('Error initializing data directory:', error as Error);
        }
    }

    async recordPrice(record: PriceRecord): Promise<void> {
        if (!this.priceCache.has(record.symbol)) {
            this.priceCache.set(record.symbol, []);
        }

        const prices = this.priceCache.get(record.symbol)!;
        prices.push(record);

        if (prices.length >= this.maxCacheSize) {
            await this.flushPriceCache(record.symbol);
        }
    }

    async recordTrade(record: TradeRecord): Promise<void> {
        if (!this.tradeCache.has(record.symbol)) {
            this.tradeCache.set(record.symbol, []);
        }

        const trades = this.tradeCache.get(record.symbol)!;
        trades.push(record);

        if (trades.length >= this.maxCacheSize) {
            await this.flushTradeCache(record.symbol);
        }
    }

    private async flushPriceCache(symbol: string): Promise<void> {
        try {
            const prices = this.priceCache.get(symbol) || [];
            if (prices.length === 0) return;

            const filename = path.join(this.dataDir, `${symbol}_prices.json`);
            const existingData = await this.readJsonFile(filename);
            const newData = [...existingData, ...prices];

            await fs.writeFile(filename, JSON.stringify(newData, null, 2));
            this.priceCache.set(symbol, []);
            this.logger.info(`Flushed price cache for ${symbol}`);
        } catch (error) {
            this.logger.error(`Error flushing price cache for ${symbol}:`, error as Error);
        }
    }

    private async flushTradeCache(symbol: string): Promise<void> {
        try {
            const trades = this.tradeCache.get(symbol) || [];
            if (trades.length === 0) return;

            const filename = path.join(this.dataDir, `${symbol}_trades.json`);
            const existingData = await this.readJsonFile(filename);
            const newData = [...existingData, ...trades];

            await fs.writeFile(filename, JSON.stringify(newData, null, 2));
            this.tradeCache.set(symbol, []);
            this.logger.info(`Flushed trade cache for ${symbol}`);
        } catch (error) {
            this.logger.error(`Error flushing trade cache for ${symbol}:`, error as Error);
        }
    }

    private async readJsonFile(filename: string): Promise<any[]> {
        try {
            const data = await
