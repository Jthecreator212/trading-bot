export class Config {
    private settings: Map<string, any>;

    constructor() {
        this.settings = new Map();
        this.initializeDefaults();
    }

    private initializeDefaults(): void {
        // Trading pairs configuration
        this.settings.set('tradingPair', 'BTCUSDT');
        
        // Risk management parameters
        this.settings.set('riskParameters', {
            maxPositionSize: 1000,
            maxDrawdownPercent: 2,
            stopLossPercent: 1,
            takeProfitPercent: 2
        });

        // Trading parameters
        this.settings.set('timeframe', '15m');
        this.settings.set('maxOpenPositions', 3);
        this.settings.set('minConfidence', 0.8);

        // Strategy parameters
        this.settings.set('strategyConfig', {
            lookbackPeriod: 20,
            indicators: ['EMA20', 'EMA50', 'RSI', 'MACD'],
            entryThreshold: 0.8,
            exitThreshold: 0.5
        });

        // Market data configuration
        this.settings.set('marketData', {
            updateInterval: 1000,
            historyLength: 100
        });
    }

    public get(key: string): any {
        if (!this.settings.has(key)) {
            throw new Error(`Configuration key '${key}' not found`);
        }
        return this.settings.get(key);
    }

    public set(key: string, value: any): void {
        this.settings.set(key, value);
    }

    public has(key: string): boolean {
        return this.settings.has(key);
    }

    public getAll(): Map<string, any> {
        return new Map(this.settings);
    }
}

export default Config;
