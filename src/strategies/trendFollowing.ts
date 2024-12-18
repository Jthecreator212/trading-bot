import { MarketData, TradingSignal } from '../types';
import { Strategy } from './index';

export class TrendFollowingStrategy {
    private config: Strategy['config'];

    constructor(config: Strategy['config']) {
        this.config = config;
    }

    public analyze(data: MarketData[]): TradingSignal | null {
        if (data.length < this.config.lookbackPeriod) {
            return null;
        }

        const latestData = data[data.length - 1];
        const ema20 = latestData.ema?.ema20;
        const ema50 = latestData.ema?.ema50;

        if (!ema20 || !ema50) {
            return null;
        }

        let signal: TradingSignal | null = null;

        if (ema20 > ema50 * (1 + this.config.entryThreshold / 100)) {
            signal = {
                type: 'BUY',
                symbol: latestData.symbol,
                price: latestData.price,
                confidence: 0.8,
                timestamp: Date.now(),
                source: 'TREND_FOLLOWING'
            };
        }

        return signal;
    }
}
