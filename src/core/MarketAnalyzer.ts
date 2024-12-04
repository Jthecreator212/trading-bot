import { Logger } from './Logger';
import { Indicators } from '../utils/indicators';

export interface MarketSignal {
    symbol: string;
    timestamp: number;
    type: 'BUY' | 'SELL' | 'NEUTRAL';
    strength: number;  // 0 to 1
    indicators: {
        rsi: number;
        macd: {
            value: number;
            signal: number;
            histogram: number;
        };
        bollingerBands: {
            upper: number;
            middle: number;
            lower: number;
        };
    };
}

export class MarketAnalyzer {
    private logger: Logger;
    private priceHistory: Map<string, number[]>;
    private signalHistory: Map<string, MarketSignal[]>;

    constructor() {
        this.logger = Logger.getInstance();
        this.priceHistory = new Map();
        this.signalHistory = new Map();
    }

    public addPrice(symbol: string, price: number): void {
        if (!this.priceHistory.has(symbol)) {
            this.priceHistory.set(symbol, []);
        }
        
        const prices = this.priceHistory.get(symbol)!;
        prices.push(price);

        // Keep last 100 prices for analysis
        if (prices.length > 100) {
            prices.shift();
        }
    }

    public analyze(symbol: string): MarketSignal {
        const prices = this.priceHistory.get(symbol) || [];
        if (prices.length < 50) {
            return this.createNeutralSignal(symbol);
        }

        const rsi = Indicators.calculateRSI(prices);
        const macd = Indicators.calculateMACD(prices);
        const bb = Indicators.calculateBollingerBands(prices);
        const currentPrice = prices[prices.length - 1];

        let signalType: 'BUY' | 'SELL' | 'NEUTRAL' = 'NEUTRAL';
        let strength = 0;

        // Analyze RSI
        if (rsi < 30) {
            signalType = 'BUY';
            strength += 0.3;
        } else if (rsi > 70) {
            signalType = 'SELL';
            strength += 0.3;
        }

        // Analyze MACD
        if (macd.histogram > 0 && macd.value > macd.signal) {
            if (signalType === 'BUY') strength += 0.3;
            else if (signalType === 'NEUTRAL') {
                signalType = 'BUY';
                strength += 0.3;
            }
        } else if (macd.histogram < 0 && macd.value < macd.signal) {
            if (signalType === 'SELL') strength += 0.3;
            else if (signalType === 'NEUTRAL') {
                signalType = 'SELL';
                strength += 0.3;
            }
        }

        // Analyze Bollinger Bands
        if (currentPrice < bb.lower) {
            if (signalType === 'BUY') strength += 0.4;
            else if (signalType === 'NEUTRAL') {
                signalType = 'BUY';
                strength += 0.4;
            }
        } else if (currentPrice > bb.upper) {
            if (signalType === 'SELL') strength += 0.4;
            else if (signalType === 'NEUTRAL') {
                signalType = 'SELL';
                strength += 0.4;
            }
        }

        const signal: MarketSignal = {
            symbol,
            timestamp: Date.now(),
            type: signalType,
            strength: Math.min(strength, 1),
            indicators: {
                rsi,
                macd,
                bollingerBands: bb
            }
        };

        this.addSignalToHistory(symbol, signal);
        this.logAnalysis(signal);

        return signal;
    }

    private addSignalToHistory(symbol: string, signal: MarketSignal): void {
        if (!this.signalHistory.has(symbol)) {
            this.signalHistory.set(symbol, []);
        }
        
        const signals = this.signalHistory.get(symbol)!;
        signals.push(signal);

        // Keep last 100 signals
        if (signals.length > 100) {
            signals.shift();
        }
    }

    private createNeutralSignal(symbol: string): MarketSignal {
        return {
            symbol,
            timestamp: Date.now(),
            type: 'NEUTRAL',
            strength: 0,
            indicators: {
                rsi: 50,
                macd: { value: 0, signal: 0, histogram: 0 },
                bollingerBands: { upper: 0, middle: 0, lower: 0 }
            }
        };
    }

    private logAnalysis(signal: MarketSignal): void {
        this.logger.info(`Market Analysis for ${signal.symbol}:`, {
            type: signal.type,
            strength: signal.strength,
            rsi: signal.indicators.rsi.toFixed(2),
            macd: signal.indicators.macd.histogram.toFixed(2)
        });
    }

    public getSignalHistory(symbol: string): MarketSignal[] {
        return this.signalHistory.get(symbol) || [];
    }
}
