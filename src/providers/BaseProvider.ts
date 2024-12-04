export interface MarketData {
    symbol: string;
    price: number;
    timestamp: number;
    volume: number;
}

export interface OrderRequest {
    symbol: string;
    side: 'BUY' | 'SELL';
    type: 'MARKET' | 'LIMIT';
    quantity: number;
    price?: number;
}

export interface OrderResponse {
    orderId: string;
    symbol: string;
    status: 'FILLED' | 'PARTIALLY_FILLED' | 'REJECTED';
    executedQty: number;
    executedPrice: number;
}

export abstract class BaseProvider {
    abstract getMarketData(symbol: string): Promise<MarketData>;
    abstract executeOrder(order: OrderRequest): Promise<OrderResponse>;
    abstract connectWebSocket(symbol: string): Promise<void>;
    abstract disconnectWebSocket(symbol: string): Promise<void>;
    abstract getHistoricalData(symbol: string, interval: string, limit: number): Promise<MarketData[]>;
    abstract getBalance(): Promise<{ [key: string]: number }>;
    abstract generateTradingReport(): Promise<any>;
}
