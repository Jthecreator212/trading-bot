// Market Data Types
export interface MarketData {
    symbol: string;
    price: number;
    volume: number;
    timestamp: number;
    rsi?: number;
    macd?: {
        macd: number;
        signal: number;
        histogram: number;
    };
    ema?: {
        ema20: number;
        ema50: number;
    };
    vwap?: number;
}

// ML Signal Types
export interface MLSignal {
    type: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;
    features: Record<string, number>;
    timestamp: number;
}

// Trading Signal Types
export interface TradingSignal {
    type: string;
    symbol: string;
    price: number;
    confidence: number;
    timestamp: number;
    source: string;
    regime?: string;
}

// Market Regime Types
export interface MarketRegime {
    regime: 'TRENDING' | 'RANGING' | 'VOLATILE' | 'QUIET';
    confidence: number;
    recommendations: string[];
}

// Risk Management Types
export interface RiskParameters {
    maxPositionSize: number;
    stopLossPercent: number;
    takeProfitPercent: number;
    maxDrawdownPercent: number;
    maxRiskPerTrade: number;
    volatilityMultiplier: number;
}

// Notification Types
export interface Alert {
    level: 'info' | 'warning' | 'error';
    message: string;
    details?: Record<string, any>;
    timestamp?: number;
}

// Performance Tracking Types
export interface PerformanceMetrics {
    totalTrades: number;
    winRate: number;
    profitLoss: number;
    sharpeRatio: number;
    maxDrawdown: number;
    timestamp: number;
}
