import WebSocket from 'ws';
import { Logger } from './Logger';
import { EventEmitter } from 'events';

interface WebSocketConfig {
    url: string;
    symbol: string;
    type: 'ticker' | 'depth' | 'kline' | 'trades';
}

export class WebSocketManager extends EventEmitter {
    private static instance: WebSocketManager;
    private logger: Logger;
    private connections: Map<string, WebSocket>;
    private connectionConfigs: Map<string, WebSocketConfig>;
    private reconnectAttempts: Map<string, number>;
    private maxReconnectAttempts: number;
    private reconnectDelay: number;

    private constructor() {
        super();
        this.logger = Logger.getInstance();
        this.connections = new Map();
        this.connectionConfigs = new Map();
        this.reconnectAttempts = new Map();
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 5000; // 5 seconds
    }

    static getInstance(): WebSocketManager {
        if (!WebSocketManager.instance) {
            WebSocketManager.instance = new WebSocketManager();
        }
        return WebSocketManager.instance;
    }

    async createConnection(config: WebSocketConfig): Promise<void> {
        const connectionId = `${config.symbol}_${config.type}`;
        
        if (this.connections.has(connectionId)) {
            this.logger.warn(`WebSocket connection already exists for ${connectionId}`);
            return;
        }

        this.connectionConfigs.set(connectionId, config);
        await this.connect(connectionId);
    }

    private async connect(connectionId: string): Promise<void> {
        const config = this.connectionConfigs.get(connectionId);
        if (!config) return;

        try {
            const ws = new WebSocket(config.url);

            ws.on('open', () => {
                this.logger.info(`WebSocket connected for ${connectionId}`);
                this.reconnectAttempts.set(connectionId, 0);
                this.emit('connected', connectionId);
            });

            ws.on('message', (data: WebSocket.Data) => {
                try {
                    const parsedData = JSON.parse(data.toString());
                    this.emit('message', connectionId, parsedData);
                } catch (error) {
                    this.logger.error(`Error parsing message for ${connectionId}:`, error as Error);
                }
            });

            ws.on('error', (error) => {
                this.logger.error(`WebSocket error for ${connectionId}:`, error);
                this.emit('error', connectionId, error);
            });

            ws.on('close', () => {
                this.logger.warn(`WebSocket closed for ${connectionId}`);
                this.handleDisconnect(connectionId);
            });

            this.connections.set(connectionId, ws);

        } catch (error) {
            this.logger.error(`Error creating WebSocket for ${connectionId}:`, error as Error);
            this.handleDisconnect(connectionId);
        }
    }

    private async handleDisconnect(connectionId: string): Promise<void> {
        const attempts = (this.reconnectAttempts.get(connectionId) || 0) + 1;
        this.reconnectAttempts.set(connectionId, attempts);

        if (attempts <= this.maxReconnectAttempts) {
            this.logger.info(`Attempting to reconnect ${connectionId} (Attempt ${attempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(async () => {
                await this.connect(connectionId);
            }, this.reconnectDelay * attempts);
            
        } else {
            this.logger.error(`Max reconnection attempts reached for ${connectionId}`);
            this.emit('maxReconnectAttemptsReached', connectionId);
        }
    }

    isConnected(connectionId: string): boolean {
        const ws = this.connections.get(connectionId);
        return ws?.readyState === WebSocket.OPEN;
    }

    async closeConnection(connectionId: string): Promise<void> {
        const ws = this.connections.get(connectionId);
        if (ws) {
            ws.close();
            this.connections.delete(connectionId);
            this.connectionConfigs.delete(connectionId);
            this.reconnectAttempts.delete(connectionId);
            this.logger.info(`Closed WebSocket connection for ${connectionId}`);
        }
    }

    async closeAllConnections(): Promise<void> {
        const connectionIds = Array.from(this.connections.keys());
        for (const connectionId of connectionIds) {
            await this.closeConnection(connectionId);
        }
        this.logger.info('All WebSocket connections closed');
    }

    getActiveConnections(): string[] {
        return Array.from(this.connections.keys());
    }
}
