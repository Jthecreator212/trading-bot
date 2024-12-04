import { MarketData } from '../types';
import { Logger } from './Logger';

interface CacheItem<T> {
    data: T;
    timestamp: number;
}

export class DataManager {
    private static instance: DataManager;
    private logger: Logger;
    private cache: Map<string, CacheItem<any>>;
    private readonly DEFAULT_TTL = 60000; // 1 minute default TTL

    private constructor() {
        this.logger = Logger.getInstance();
        this.cache = new Map();
    }

    static getInstance(): DataManager {
        if (!DataManager.instance) {
            DataManager.instance = new DataManager();
        }
        return DataManager.instance;
    }

    async cacheMarketData(symbol: string, data: MarketData): Promise<void> {
        const key = `market_${symbol}`;
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
        this.logger.debug(`Cached market data for ${symbol}`, data);
    }

    async getMarketData(symbol: string, maxAge: number = this.DEFAULT_TTL): Promise<MarketData | null> {
        const key = `market_${symbol}`;
        const cached = this.cache.get(key);

        if (cached && Date.now() - cached.timestamp < maxAge) {
            return cached.data;
        }

        this.logger.debug(`Cache miss for ${symbol}`);
        return null;
    }

    async clearCache(): Promise<void> {
        this.cache.clear();
        this.logger.info('Cache cleared');
    }

    // Helper method to store OHLCV data
    async cacheOHLCV(symbol: string, timeframe: string, data: any[]): Promise<void> {
        const key = `ohlcv_${symbol}_${timeframe}`;
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    // Helper method to get OHLCV data
    async getOHLCV(symbol: string, timeframe: string, maxAge: number = this.DEFAULT_TTL): Promise<any[] | null> {
        const key = `ohlcv_${symbol}_${timeframe}`;
        const cached = this.cache.get(key);

        if (cached && Date.now() - cached.timestamp < maxAge) {
            return cached.data;
        }

        return null;
    }

    // Method to clean up old cache entries
    private cleanupCache(): void {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > this.DEFAULT_TTL) {
                this.cache.delete(key);
                this.logger.debug(`Cleaned up cached data for ${key}`);
            }
        }
    }
}
