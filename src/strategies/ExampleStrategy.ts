import { BaseStrategy } from './BaseStrategy';
import { TradingEngine } from '../core/Engine';
import { MarketDepth } from '../core/MarketDepth';
import { RiskManager } from '../core/RiskManager';

export class ExampleStrategy extends BaseStrategy {
    private engine: TradingEngine;
    private marketDepth: MarketDepth;
    private riskManager: RiskManager;

    constructor(symbol: string, interval: number, minVolume: number) {
        super(symbol, interval, minVolume);
        this.engine = TradingEngine.getInstance();
        this.marketDepth = this.engine.getComponent<MarketDepth>('marketDepth');
        this.riskManager = this.engine.getComponent<RiskManager>('riskManager');
    }

    async analyze(data: any): Promise<void> {
        try {
            this.log('Analyzing market data...');
            
            // Get market depth data
            const depth = await this.marketDepth.getDepth(this.symbol);
            
            // Check if volume meets minimum requirements
            if (depth.volume < this.minVolume) {
                this.log('Volume too low, skipping analysis');
                return;
            }

            // Example analysis logic
            const signal = this.calculateSignal(depth);
            
            this.emit('analysisComplete', {
                symbol: this.symbol,
                signal: signal,
                price: depth.price,
                volume: depth.volume
            });

        } catch (error) {
            this.log(`Analysis error: ${error.message}`);
        }
    }

    async execute(): Promise<void> {
        try {
            this.log('Executing trade...');
            
            // Check risk parameters before executing
            if (!this.riskManager.checkTradeRisk(this.symbol)) {
                this.log('Trade rejected by risk manager');
                return;
            }

            // Example execution logic
            const order = {
                symbol: this.symbol,
                type: 'market',
                side: 'buy',
                quantity: 1
            };

            this.emit('orderExecuted', order);
            this.log('Trade executed successfully');

        } catch (error) {
            this.log(`Execution error: ${error.message}`);
        }
    }

    private calculateSignal(depth: any): 'buy' | 'sell' | 'hold' {
        // Example signal calculation
        const buyPressure = depth.bids.reduce((sum: number, bid: any) => sum + bid.quantity, 0);
        const sellPressure = depth.asks.reduce((sum: number, ask: any) => sum + ask.quantity, 0);
        
        if (buyPressure > sellPressure * 1.2) return 'buy';
        if (sellPressure > buyPressure * 1.2) return 'sell';
        return 'hold';
    }
}
