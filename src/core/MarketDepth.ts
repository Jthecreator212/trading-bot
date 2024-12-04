import { Logger } from './Logger';
import WebSocket from 'ws';

interface OrderBookEntry {
    price: number;
    quantity: number;
}

interface OrderBook {
    bids: OrderBookEntry[];
    asks: OrderBookEntry[];
    timestamp: number;
}

export class MarketDepth {
    private static instance: MarketDepth;
    private logger: Logger;
    private orderBooks: Map<string, OrderBook>;
    private webSockets: Map<string, WebSocket>;
    private depthLimit: number;

    private constructor(depthLimit: number = 20) {
        this.logger = Logger.getInstance();
        this.orderBooks = new Map();
        this.webSockets = new Map();
        this.depthLimit = depthLimit;
    }

    static getInstance(): MarketDepth {
        if (!MarketDepth.instance) {
            MarketDepth.instance = new MarketDepth();
        }
        return MarketDepth.instance;
    }

    async connectToSymbol(symbol: string): Promise<void> {
        if (this.webSockets.has(symbol)) {
            return;
        }

        const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth@100ms`);

        ws.on('open', () => {
            this.logger.info(`Connected to order book for ${symbol}`);
        });

        ws.on('message', (data: WebSocket.Data) => {
            try {
                const depthUpdate = JSON.parse(data.toString());
                this.updateOrderBook(symbol, depthUpdate);
            } catch (error) {
                this.logger.error(`Error processing depth data for ${symbol}:`, error as Error);
            }
        });

        ws.on('error', (error) => {
            this.logger.error(`WebSocket error for ${symbol}:`, error);
        });

        this.webSockets.set(symbol, ws);
    }

    private updateOrderBook(symbol: string, update: any): void {
        let orderBook = this.orderBooks.get(symbol);
        if (!orderBook) {
            orderBook = {
                bids: [],
                asks: [],
                timestamp: Date.now()
            };
        }

        // Update bids
        update.b.forEach((bid: [string, string]) => {
            const price = parseFloat(bid[0]);
            const quantity = parseFloat(bid[1]);
            this.updatePriceLevel(orderBook!.bids, price, quantity);
        });

        // Update asks
        update.a.forEach((ask: [string, string]) => {
            const price = parseFloat(ask[0]);
            const quantity = parseFloat(ask[1]);
            this.updatePriceLevel(orderBook!.asks, price, quantity);
        });

        orderBook.timestamp = Date.now();
        this.orderBooks.set(symbol, orderBook);
    }

    private updatePriceLevel(levels: OrderBookEntry[], price: number, quantity: number): void {
        const index = levels.findIndex(level => level.price === price);
        
        if (quantity === 0) {
            if (index !== -1) {
                levels.splice(index, 1);
            }
        } else {
            if (index !== -1) {
                levels[index].quantity = quantity;
            } else {
                levels.push({ price, quantity });
                levels.sort((a, b) => b.price - a.price);
            }
        }

        // Keep only top levels based on depth limit
        if (levels.length > this.depthLimit) {
            levels.length = this.depthLimit;
        }
    }

    getOrderBook(symbol: string): OrderBook | undefined {
        return this.orderBooks.get(symbol);
    }

    stop(): void {
        for (const [symbol, ws] of this.webSockets.entries()) {
            ws.close();
            this.logger.info(`Closed order book connection for ${symbol}`);
        }
        this.webSockets.clear();
        this.orderBooks.clear();
    }
}
