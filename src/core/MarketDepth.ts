import { MarketData } from '../types';

export class MarketDepth {
    private depth: Map<string, MarketData[]> = new Map();

    public update(data: MarketData): void {
        if (!this.depth.has(data.symbol)) {
            this.depth.set(data.symbol, []);
        }
        
        const symbolDepth = this.depth.get(data.symbol)!;
        symbolDepth.push(data);

        // Keep only last 100 depth updates
        if (symbolDepth.length > 100) {
            symbolDepth.shift();
        }
    }

    public getDepth(symbol: string): MarketData[] {
        return this.depth.get(symbol) || [];
    }
}

export default MarketDepth;
