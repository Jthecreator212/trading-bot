import { Logger } from './Logger';

interface RiskParameters {
    maxPositionSize: number;
    maxDrawdownPercent: number;
    stopLossPercent: number;
    takeProfitPercent: number;
}

export class RiskManager {
    private static instance: RiskManager;
    private logger: Logger;
    private parameters: RiskParameters;

    private constructor() {
        this.logger = Logger.getInstance();
        this.parameters = {
            maxPositionSize: 1000,
            maxDrawdownPercent: 2,
            stopLossPercent: 1,
            takeProfitPercent: 2
        };
    }

    static getInstance(): RiskManager {
        if (!RiskManager.instance) {
            RiskManager.instance = new RiskManager();
        }
        return RiskManager.instance;
    }

    setRiskParameters(params: Partial<RiskParameters>): void {
        this.parameters = { ...this.parameters, ...params };
        this.logger.info('Risk parameters updated:', this.parameters);
    }

    calculatePositionSize(price: number, balance: number): number {
        const maxPosition = Math.min(
            this.parameters.maxPositionSize,
            balance * (this.parameters.maxDrawdownPercent / 100)
        );
        
        const positionSize = maxPosition / price;
        this.logger.info(`Calculated position size: ${positionSize}`);
        return positionSize;
    }

    calculateStopLoss(entryPrice: number, side: 'LONG' | 'SHORT'): number {
        const stopLossAmount = entryPrice * (this.parameters.stopLossPercent / 100);
        return side === 'LONG' ? 
            entryPrice - stopLossAmount : 
            entryPrice + stopLossAmount;
    }

    calculateTakeProfit(entryPrice: number, side: 'LONG' | 'SHORT'): number {
        const takeProfitAmount = entryPrice * (this.parameters.takeProfitPercent / 100);
        return side === 'LONG' ? 
            entryPrice + takeProfitAmount : 
            entryPrice - takeProfitAmount;
    }

    validateTrade(price: number, size: number, balance: number): boolean {
        const tradeValue = price * size;
        
        if (tradeValue > this.parameters.maxPositionSize) {
            this.logger.warn('Trade rejected: Position size too large');
            return false;
        }

        if (tradeValue > balance * (this.parameters.maxDrawdownPercent / 100)) {
            this.logger.warn('Trade rejected: Exceeds maximum drawdown risk');
            return false;
        }

        return true;
    }
}
