export enum StrategyType {
    TREND_FOLLOWING = 'TREND_FOLLOWING',
    MEAN_REVERSION = 'MEAN_REVERSION',
    BREAKOUT = 'BREAKOUT',
    VOLUME_BASED = 'VOLUME_BASED',
    RSI_MACD = 'RSI_MACD'
}

export interface Strategy {
    type: StrategyType;
    config: {
        timeframe: string;
        lookbackPeriod: number;
        indicators: string[];
        entryThreshold: number;
        exitThreshold: number;
    };
}

export const strategies: Record<StrategyType, Strategy> = {
    [StrategyType.TREND_FOLLOWING]: {
        type: StrategyType.TREND_FOLLOWING,
        config: {
            timeframe: '15m',
            lookbackPeriod: 20,
            indicators: ['EMA20', 'EMA50'],
            entryThreshold: 0.8,
            exitThreshold: 0.5
        }
    },
    [StrategyType.MEAN_REVERSION]: {
        type: StrategyType.MEAN_REVERSION,
        config: {
            timeframe: '5m',
            lookbackPeriod: 50,
            indicators: ['BB', 'RSI'],
            entryThreshold: 0.7,
            exitThreshold: 0.6
        }
    }
};

export { TrendFollowingStrategy } from './trendFollowing';
