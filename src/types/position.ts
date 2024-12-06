export interface Position {
    symbol: string;
    type: 'LONG' | 'SHORT';
    entry: number;
    stopLoss: number;
    size: number;
    timestamp: number;
}

export interface ClosedPosition extends Position {
    exitPrice: number;
    pnl: number;
    closedAt: number;
}
