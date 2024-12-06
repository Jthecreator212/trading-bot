export interface Candle {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface BreakoutSignal {
    type: 'LONG' | 'SHORT' | 'NONE';
    entry?: number;
    stopLoss?: number;
    takeProfit?: number;
}
