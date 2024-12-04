import { EventEmitter } from 'events';

export class TrendAnalyzer extends EventEmitter {
    private id: string;
    private prices: number[] = [];

    constructor(id: string) {
        super();
        this.id = id;
    }

    addPrice(price: number): void {
        this.prices.push(price);
        if (this.prices.length > 100) {
            this.prices.shift(); // Keep only the last 100 prices
        }
        this.analyzeTrend();
    }

    private analyzeTrend(): void {
        if (this.prices.length < 2) return;

        const trend = this.prices[this.prices.length - 1] - this.prices[0];
        this.emit('trendUpdate', { trend });
        console.log(`[${this.id}] Trend: ${trend > 0 ? 'Upward' : 'Downward'}`);
    }
}
