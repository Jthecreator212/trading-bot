import { EventEmitter } from 'events';
import WebSocket from 'ws';

export class MarketDataAgent extends EventEmitter {
    private id: string;
    private interval: number;
    private ws: WebSocket | null = null;
    private connected: boolean = false;

    constructor(id: string, interval: number) {
        super();
        this.id = id;
        this.interval = interval;
    }

    async start(): Promise<void> {
        this.connectWebSocket();
    }

    async stop(): Promise<void> {
        if (this.ws) {
            this.ws.close();
        }
        this.connected = false;
    }

    private connectWebSocket(): void {
        this.ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');

        this.ws.on('open', () => {
            console.log(`[${this.id}] WebSocket connected`);
            this.connected = true;
        });

        this.ws.on('message', (data: WebSocket.Data) => {
            try {
                const ticker = JSON.parse(data.toString());
                this.emit('priceUpdate', {
                    symbol: 'BTCUSDT',
                    price: parseFloat(ticker.c),
                    timestamp: Date.now()
                });
            } catch (error) {
                console.error(`[${this.id}] Error processing message:`, error);
            }
        });

        this.ws.on('error', (error) => {
            console.error(`[${this.id}] WebSocket error:`, error);
        });

        this.ws.on('close', () => {
            this.connected = false;
            console.log(`[${this.id}] WebSocket disconnected, reconnecting...`);
            setTimeout(() => this.connectWebSocket(), 5000);
        });
    }
}
