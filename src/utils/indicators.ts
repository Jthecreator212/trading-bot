export class Indicators {
    /**
     * Calculate Relative Strength Index (RSI)
     */
    static calculateRSI(prices: number[], period: number = 14): number {
        if (prices.length < period + 1) {
            return 50; // Default neutral value
        }

        let gains = 0;
        let losses = 0;

        // Calculate initial average gain and loss
        for (let i = 1; i <= period; i++) {
            const difference = prices[i] - prices[i - 1];
            if (difference >= 0) {
                gains += difference;
            } else {
                losses -= difference;
            }
        }

        let avgGain = gains / period;
        let avgLoss = losses / period;

        // Calculate subsequent values
        for (let i = period + 1; i < prices.length; i++) {
            const difference = prices[i] - prices[i - 1];
            if (difference >= 0) {
                avgGain = (avgGain * (period - 1) + difference) / period;
                avgLoss = (avgLoss * (period - 1)) / period;
            } else {
                avgGain = (avgGain * (period - 1)) / period;
                avgLoss = (avgLoss * (period - 1) - difference) / period;
            }
        }

        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }

    /**
     * Calculate Moving Average Convergence Divergence (MACD)
     */
    static calculateMACD(prices: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9): {
        value: number;
        signal: number;
        histogram: number;
    } {
        const fastEMA = this.calculateEMA(prices, fastPeriod);
        const slowEMA = this.calculateEMA(prices, slowPeriod);
        const macdLine = fastEMA - slowEMA;
        const signalLine = this.calculateEMA([...Array(prices.length - slowPeriod).fill(0), macdLine], signalPeriod);
        
        return {
            value: macdLine,
            signal: signalLine,
            histogram: macdLine - signalLine
        };
    }

    /**
     * Calculate Bollinger Bands
     */
    static calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2): {
        upper: number;
        middle: number;
        lower: number;
    } {
        const sma = this.calculateSMA(prices, period);
        const standardDeviation = this.calculateStandardDeviation(prices, period);

        return {
            upper: sma + (standardDeviation * stdDev),
            middle: sma,
            lower: sma - (standardDeviation * stdDev)
        };
    }

    /**
     * Calculate Simple Moving Average (SMA)
     */
    static calculateSMA(prices: number[], period: number): number {
        if (prices.length < period) {
            return prices[prices.length - 1];
        }

        const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
        return sum / period;
    }

    /**
     * Calculate Exponential Moving Average (EMA)
     */
    static calculateEMA(prices: number[], period: number): number {
        if (prices.length < period) {
            return prices[prices.length - 1];
        }

        const multiplier = 2 / (period + 1);
        let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;

        for (let i = period; i < prices.length; i++) {
            ema = (prices[i] - ema) * multiplier + ema;
        }

        return ema;
    }

    /**
     * Calculate Standard Deviation
     */
    private static calculateStandardDeviation(prices: number[], period: number): number {
        const sma = this.calculateSMA(prices, period);
        const squaredDifferences = prices.slice(-period).map(price => Math.pow(price - sma, 2));
        const variance = squaredDifferences.reduce((a, b) => a + b, 0) / period;
        return Math.sqrt(variance);
    }
}
