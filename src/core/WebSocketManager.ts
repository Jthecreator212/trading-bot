import WebSocket from 'ws';

export class WebSocketManager {
    private ws: WebSocket | null = null;
    private url: string;

    constructor(url: string = 'wss://stream.binance.com:9443/ws') {
        this.url = url;
    }

    public async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(this.url);

            this.ws.on('open', () => {
                console.log('WebSocket connected');
                resolve();
            });

            this.ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                reject(error);
            });
        });
    }

    public async disconnect(): Promise<void> {
        if (this.ws) {
            this.ws.close();
        }
    }

    public isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }
}

export default WebSocketManager;
