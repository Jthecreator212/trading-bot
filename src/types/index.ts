export interface MarketData {
    symbol: string;
    price: number;
    timestamp: number;
    volume: number;
}

export interface Order {
    symbol: string;
    side: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    type: 'MARKET' | 'LIMIT';
}

export interface StrategyConfig {
    rsiPeriod: number;
    smaPeriod: number;
    minVolume: number;
}

export interface RiskParameters {
    maxPositionSize: number;
    maxDrawdownPercent: number;
    stopLossPercent: number;
    takeProfitPercent: number;
}
