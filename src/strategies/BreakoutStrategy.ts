import { BaseStrategy } from './BaseStrategy';
import { DataManager } from '../core/DataManager';
import { Candle, BreakoutSignal } from '../types/market';

export class BreakoutStrategy extends BaseStrategy {
    private dataManager: DataManager;
    private config: {
        symbol: string;
        lookbackPeriod: number;
        volumeThreshold: number;
    };

    constructor() {
        super();
        this.dataManager = new DataManager();
        this.config = {
            symbol: 'BTCUSDT',
            lookbackPeriod: 20,
            volumeThreshold: 1.5
        };
    }

    protected async getMultiTimeframeData() {
        try {
            const dailyData = await this.dataManager.fetchCandles({
                symbol: this.config.symbol,
                interval: '1d',
                limit: 100
            });
            
            const hourlyData = await this.dataManager.fetchCandles({
                symbol: this.config.symbol,
                interval: '1h',
                limit: 200
            });
            
            return { dailyData, hourlyData };
        } catch (error) {
            console.error('Error fetching data:', error);
            return { dailyData: [], hourlyData: [] };
        }
    }

    async analyze(candles: Candle[]): Promise<BreakoutSignal> {
        try {
            if (!candles || candles.length < this.config.lookbackPeriod) {
                return { type: 'NONE' };
            }

            return this.analyzeBreakout(candles);
        } catch (error) {
            console.error('Analysis error:', error);
            return { type: 'NONE' };
        }
    }

    private analyzeBreakout(candles: Candle[]): BreakoutSignal {
        const current = candles[candles.length - 1];
        const previous = candles.slice(-this.config.lookbackPeriod, -1);
        
        const resistance = Math.max(...previous.map(c => c.high));
        const support = Math.min(...previous.map(c => c.low));
        const avgVolume = previous.reduce((sum, c) => sum + c.volume, 0) / previous.length;
        
        const isVolumeBreakout = current.volume > (avgVolume * this.config.volumeThreshold);
        
        if (current.close > resistance && isVolumeBreakout) {
            return {
                type: 'LONG',
                entry: current.close,
                stopLoss: support
            };
        }
        
        if (current.close < support && isVolumeBreakout) {
            return {
                type: 'SHORT',
                entry: current.close,
                stopLoss: resistance
            };
        }
        
        return { type: 'NONE' };
    }
}
