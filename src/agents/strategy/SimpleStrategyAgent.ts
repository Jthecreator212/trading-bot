import { EventEmitter } from 'events';

interface Order {
    symbol: string;
    side: 'BUY' | 'SELL';
    quantity: number;
    price: number;
}

export class SimpleStrategyAgent extends EventEmitter {
    private id: string;
    private lastPrice: number = 0;
    private prices: number[] = [];
    private position: 'NONE' | 'LONG' | 'SHORT' = 'NONE';

    constructor(id: string) {
        super();
        this.id = id;
    }

    updateMarketData(marketData: any): void {
        this.lastPrice = marketData.price;
        this.prices.push(this.lastPrice);
        
        // Keep last 10 prices for analysis
        if (this.prices.length > 10) {
            this.prices.shift();
        }
        
        this.analyzeMarket();
    }

    private analyzeMarket(): void {
        if (this.prices.length < 10) return;

        const shortTermAvg = this.calculateAverage(this.prices.slice(-3));
        const longTermAvg = this.calculateAverage(this.prices);

        console.log(`[${this.id}] Short-term Avg: ${shortTermAvg.toFixed(2)}, Long-term Avg: ${longTermAvg.toFixed(2)}`);

        // Trading logic
        if (shortTermAvg > longTermAvg && this.position !== 'LONG') {
            this.position = 'LONG';
            const order: Order = {
                symbol: 'BTCUSDT',
                side: 'BUY',
                quantity: 0.001,
                price: this.lastPrice
            };
            console.log(`[${this.id}] SIGNAL: BUY at ${this.lastPrice}`);
            this.emit('order', order);
        } 
        else if (shortTermAvg < longTermAvg && this.position !== 'SHORT') {
            this.position = 'SHORT';
            const order: Order = {
                symbol: 'BTCUSDT',
                side: 'SELL',
                quantity: 0.001,
                price: this.lastPrice
            };
            console.log(`[${this.id}] SIGNAL: SELL at ${this.lastPrice}`);
            this.emit('order', order);
        }
    }

    private calculateAverage(prices: number[]): number {
        return prices.reduce((a, b) => a + b, 0) / prices.length;
    }
}
