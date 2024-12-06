import { MarketData } from '../types';

export class DataManager {
    private marketData: Map<string, MarketData[]> = new Map();
    private readonly maxDataPoints = 1000;

    public storeMarketData(symbol: string, data: MarketData): void {
        if (!this.marketData.has(symbol)) {
            this.marketData.set(symbol, []);
        }

        const symbolData = this.marketData.get(symbol)!;
        symbolData.push(data);

        // Keep only the most recent data points
        if (symbolData.length > this.maxDataPoints) {
            symbolData.shift();
        }
    }

    public getRecentData(symbol: string, count: number = 50): MarketData[] {
        const symbolData = this.marketData.get(symbol);
        if (!symbolData) return [];

        return symbolData.slice(-count);
    }

    public getLatestData(symbol: string): MarketData | null {
        const symbolData = this.marketData.get(symbol);
        if (!symbolData || symbolData.length === 0) return null;

        return symbolData[symbolData.length - 1];
    }

    public clearData(symbol: string): void {
        this.marketData.delete(symbol);
    }

    public getAllSymbols(): string[] {
        return Array.from(this.marketData.keys());
    }
}

export default DataManager;
