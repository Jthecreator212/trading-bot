import { MarketData, MLSignal } from '../../types';

export class MLSignalGenerator {
    private readonly lookbackPeriod = 2; // Minimum data points needed
    private dataBuffer: MarketData[] = [];

    constructor() {
        // Initialize basic configuration
    }

    private addToBuffer(data: MarketData[]): void {
        this.dataBuffer = [...this.dataBuffer, ...data].slice(-this.lookbackPeriod);
    }

    private calculatePriceChange(data: MarketData[]): number {
        if (data.length < 2) return 0;
        const latest = data[data.length - 1].price;
        const previous = data[data.length - 2].price;
        return ((latest - previous) / previous) * 100;
    }

    private calculateVolatility(data: MarketData[]): number {
        if (data.length < 2) return 0;
        const prices = data.map(d => d.price);
        const returns = prices.slice(1).map((price, i) => 
            (price - prices[i]) / prices[i]
        );
        return Math.sqrt(returns.reduce((sum, ret) => sum + ret * ret, 0) / returns.length) * 100;
    }

    private calculateTrendStrength(data: MarketData[]): number {
        if (data.length < 2) return 0;
        const prices = data.map(d => d.price);
        const ema20 = data[data.length - 1].ema?.ema20 || prices[prices.length - 1];
        const ema50 = data[data.length - 1].ema?.ema50 || prices[prices.length - 1];
        return ((ema20 - ema50) / ema50) * 100;
    }

    private calculateVolumeProfile(data: MarketData[]): number {
        if (data.length < 2) return 0;
        const avgVolume = data.reduce((sum, d) => sum + d.volume, 0) / data.length;
        const latestVolume = data[data.length - 1].volume;
        return (latestVolume / avgVolume) - 1;
    }

    private extractFeatures(marketData: MarketData[]): number[] {
        const latestData = marketData[marketData.length - 1];
        const priceChange = this.calculatePriceChange(marketData);
        const volatility = this.calculateVolatility(marketData);
        const trendStrength = this.calculateTrendStrength(marketData);
        const volumeProfile = this.calculateVolumeProfile(marketData);

        return [
            latestData.rsi || 50,
            latestData.macd?.macd || 0,
            volumeProfile,
            priceChange,
            volatility,
            trendStrength
        ];
    }

    public async generateSignals(marketData: MarketData[]): Promise<MLSignal> {
        try {
            // Add new data to buffer
            this.addToBuffer(marketData);

            // Initial data collection phase
            if (this.dataBuffer.length < this.lookbackPeriod) {
                return {
                    type: 'HOLD',
                    confidence: 0.5,
                    features: {
                        priceChange: 0,
                        volatility: 0,
                        trendStrength: 0,
                        volumeProfile: 0,
                        rsi: 50,
                        macd: 0
                    },
                    timestamp: Date.now()
                };
            }

            const features = this.extractFeatures(this.dataBuffer);
            const [rsi, macd, volumeProfile, priceChange, volatility, trendStrength] = features;

            // Enhanced signal generation logic
            let signalType: MLSignal['type'] = 'HOLD';
            let confidence = 0.5;

            // Trend following with multiple confirmations
            if (Math.abs(trendStrength) > 0.5) {
                const volumeConfirmation = volumeProfile > 0.2;
                const rsiConfirmation = trendStrength > 0 ? rsi < 70 : rsi > 30;
                const macdConfirmation = Math.sign(macd) === Math.sign(trendStrength);

                if (trendStrength > 0 && volumeConfirmation && rsiConfirmation && macdConfirmation) {
                    signalType = 'BUY';
                    confidence = Math.min(0.5 + Math.abs(trendStrength) / 10, 0.95);
                } else if (trendStrength < 0 && volumeConfirmation && rsiConfirmation && macdConfirmation) {
                    signalType = 'SELL';
                    confidence = Math.min(0.5 + Math.abs(trendStrength) / 10, 0.95);
                }
            }

            // Volatility adjustment
            if (volatility > 2) {
                confidence = Math.max(confidence * (1 - volatility / 20), 0.5);
            }

            // Volume confirmation adjustment
            if (Math.abs(volumeProfile) > 1) {
                confidence = Math.min(confidence * (1 + Math.abs(volumeProfile) / 10), 0.95);
            }

            return {
                type: signalType,
                confidence,
                features: {
                    rsi,
                    macd,
                    volumeProfile,
                    priceChange,
                    volatility,
                    trendStrength
                },
                timestamp: Date.now()
            };
        } catch (error) {
            console.error('Error in generateSignals:', error);
            throw error;
        }
    }
}

export default MLSignalGenerator;
