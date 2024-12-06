import { EventEmitter } from 'events';
import WebSocket from 'ws';
import { MarketData } from '../../types';

export class MarketDataAgent extends EventEmitter {
    private websocket: WebSocket | null = null;
    private connected: boolean = false;
    private reconnectAttempts: number = 0;
    private readonly MAX_RECONNECT_ATTEMPTS = 5;

    constructor() {
        super();
    }

    public async connect(symbol: string): Promise<void> {
        try {
            // Initialize WebSocket connection
            const wsEndpoint = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`;
            this.websocket = new WebSocket(wsEndpoint);

            this.websocket.on('open', () => {
                this.connected = true;
                this.reconnectAttempts = 0;
                console.log(`WebSocket connected for ${symbol}`);
            });

            this.websocket.on('message', (data: WebSocket.Data) => {
                try {
                    const parsedData = JSON.parse(data.toString());
                    const marketData: MarketData = {
                        symbol: symbol,
                        price: parseFloat(parsedData.p),
                        volume: parseFloat(parsedData.q),
                        timestamp: parsedData.T,
                        rsi: undefined,
                        macd: undefined,
                        ema: undefined
                    };
                    this.emit('marketData', marketData);
                } catch (error) {
                    console.error('Error parsing market data:', error);
                }
            });

            this.websocket.on('error', (error) => {
                console.error('WebSocket error:', error);
                this.connected = false;
                this.attemptReconnect(symbol);
            });

            this.websocket.on('close', () => {
                this.connected = false;
                console.log('WebSocket connection closed');
                this.attemptReconnect(symbol);
            });

        } catch (error) {
            console.error('Error connecting to WebSocket:', error);
            throw error;
        }
    }

    private async attemptReconnect(symbol: string): Promise<void> {
        if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect... (Attempt ${this.reconnectAttempts})`);
            
            // Wait for a few seconds before reconnecting
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            try {
                await this.connect(symbol);
            } catch (error) {
                console.error('Reconnection attempt failed:', error);
            }
        } else {
            console.error('Max reconnection attempts reached');
            this.emit('error', new Error('Max reconnection attempts reached'));
        }
    }

    public disconnect(): void {
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
            this.connected = false;
        }
    }

    public isConnected(): boolean {
        return this.connected;
    }

    public getConnectionStatus(): string {
        return this.connected ? 'Connected' : 'Disconnected';
    }
}

export default MarketDataAgent;
