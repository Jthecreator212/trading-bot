import { MarketRegime } from './analysis/MarketRegimeAnalyzer';
import { TradingSignal } from '../types';

interface RiskParameters {
    maxPositionSize: number;
    stopLossPercent: number;
    takeProfitPercent: number;
    maxDrawdownPercent: number;
    maxRiskPerTrade: number;
    volatilityMultiplier: number;
}

export class RiskManager {
    private parameters: RiskParameters = {
        maxPositionSize: 1000,
        stopLossPercent: 1,
        takeProfitPercent: 2,
        maxDrawdownPercent: 2,
        maxRiskPerTrade: 1,
        volatilityMultiplier: 1.5
    };

    private accountBalance: number = 10000; // Default balance

    public updateParameters(params: Partial<RiskParameters>): void {
        this.parameters = { ...this.parameters, ...params };
    }

    public setAccountBalance(balance: number): void {
        this.accountBalance = balance;
    }

    public adjustRiskParameters(regime: MarketRegime): void {
        switch (regime.regime) {
            case 'VOLATILE':
                this.parameters.stopLossPercent *= this.parameters.volatilityMultiplier;
                this.parameters.maxPositionSize *= 0.5;
                this.parameters.maxRiskPerTrade *= 0.5;
                break;
                
            case 'TRENDING':
                this.parameters.takeProfitPercent *= 1.2;
                this.parameters.maxPositionSize *= 1.2;
                this.parameters.maxRiskPerTrade *= 1.1;
                break;
                
            case 'RANGING':
                this.parameters.takeProfitPercent *= 0.8;
                this.parameters.stopLossPercent *= 0.8;
                this.parameters.maxPositionSize *= 0.9;
                break;
                
            case 'QUIET':
                this.resetParameters();
                break;
        }
    }

    public assessRisk(signal: TradingSignal, regime: MarketRegime): boolean {
        // Validate inputs
        if (!signal || !regime) {
            return false;
        }

        // Basic risk checks
        if (regime.regime === 'VOLATILE' && regime.confidence < 70) {
            return false;
        }

        if (signal.confidence < 0.8) {
            return false;
        }

        // Position size check
        const positionSize = this.calculatePositionSize(signal.price);
        if (positionSize > this.parameters.maxPositionSize) {
            return false;
        }

        // Maximum drawdown check
        const potentialLoss = positionSize * (this.parameters.stopLossPercent / 100);
        if (potentialLoss > (this.accountBalance * (this.parameters.maxDrawdownPercent / 100))) {
            return false;
        }

        return true;
    }

    public calculatePositionSize(currentPrice: number): number {
        const riskAmount = this.accountBalance * (this.parameters.maxRiskPerTrade / 100);
        const stopLossAmount = currentPrice * (this.parameters.stopLossPercent / 100);
        
        return Math.min(
            riskAmount / stopLossAmount,
            this.parameters.maxPositionSize
        );
    }

    public getStopLoss(entryPrice: number): number {
        return entryPrice * (1 - this.parameters.stopLossPercent / 100);
    }

    public getTakeProfit(entryPrice: number): number {
        return entryPrice * (1 + this.parameters.takeProfitPercent / 100);
    }

    public getMaxPositionSize(): number {
        return this.parameters.maxPositionSize;
    }

    private resetParameters(): void {
        this.parameters = {
            maxPositionSize: 1000,
            stopLossPercent: 1,
            takeProfitPercent: 2,
            maxDrawdownPercent: 2,
            maxRiskPerTrade: 1,
            volatilityMultiplier: 1.5
        };
    }

    public getCurrentParameters(): RiskParameters {
        return { ...this.parameters };
    }
}

export default RiskManager;
