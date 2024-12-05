import { Logger } from './Logger';
import WebSocket from 'ws';
import { EventEmitter } from 'events';

export class WebSocketManager extends EventEmitter {
    private logger: Logger;
    private connections: Map<string, WebSocket>;
    private wsUrl: string;

    constructor() {
        super();
        this.logger = Logger.getInstance();
        this.connections = new Map();
        this.wsUrl = process.env.WEBSOCKET_URL || 'wss://stream.binance.com:9443/ws';
    }

    public connect(url: string, symbol: string): void {
        if (!url || !this.isValidUrl(url)) {
            this.logger.error('Invalid WebSocket URL');
            return;
        }

        try {
            this.logger.info(`Connecting to WebSocket for ${symbol}`);
            const ws = new WebSocket(url);

            ws.on('open', () => {
                this.logger.info(`WebSocket connected for ${symbol}`);
                this.connections.set(symbol, ws);
                this.emit('connected', symbol);
            });

            ws.on('message', (data: WebSocket.Data) => {
                try {
                    const parsedData = JSON.parse(data.toString());
                    this.emit('message', symbol, parsedData);
                } catch (error) {
                    this.logger.error(`Error parsing WebSocket message: ${error}`);
                }
            });

            ws.on('close', () => {
                this.logger.warn(`WebSocket connection closed for ${symbol}`);
                this.connections.delete(symbol);
            });

            ws.on('error', (error) => {
                this.logger.error(`WebSocket error for ${symbol}:`, error);
                this.emit('error', symbol, error);
            });
        } catch (error) {
            this.logger.error(`Failed to connect WebSocket for ${symbol}:`, error);
        }
    }

    public disconnect(symbol?: string): void {
        try {
            if (symbol) {
                const ws = this.connections.get(symbol);
                if (ws) {
                    ws.close();
                    this.connections.delete(symbol);
                    this.logger.info(`WebSocket disconnected for ${symbol}`);
                }
            } else {
                this.connections.forEach((ws, sym) => {
                    ws.close();
                    this.logger.info(`WebSocket disconnected for ${sym}`);
                });
                this.connections.clear();
            }
        } catch (error) {
            this.logger.error('Error disconnecting WebSocket:', error);
        }
    }

    public isConnected(symbol: string): boolean {
        const ws = this.connections.get(symbol);
        return ws?.readyState === WebSocket.OPEN;
    }

    // Add this method
    public getConnections(): string[] {
        return Array.from(this.connections.keys());
    }

    private isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
}
