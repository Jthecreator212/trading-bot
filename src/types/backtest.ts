export interface BacktestReport {
    totalTrades: number;
    winningTrades: number;
    winRate: number;
    totalReturn: number;
    finalBalance: number;
    trades: BacktestTrade[];
}

export interface BacktestTrade {
    type: 'LONG' | 'SHORT';
    entry: number;
    stopLoss: number;
    timestamp: number;
    size: number;
    exitPrice?: number;
    pnl?: number;
}
