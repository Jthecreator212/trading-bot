import { Logger } from './Logger';
import { BaseStrategy } from '../strategies/BaseStrategy';
import { BacktestEngine } from './BacktestEngine';

interface OptimizationResult {
    parameters: Record<string, number>;
    performance: {
        totalPnL: number;
        winRate: number;
        sharpeRatio: number;
        maxDrawdown: number;
    };
}

interface OptimizationConfig {
    parameterRanges: {
        [key: string]: {
            min: number;
            max: number;
            step: number;
        };
    };
    initialBalance: number;
    startDate: Date;
    endDate: Date;
}

export class StrategyOptimizer {
    private logger: Logger;
    private strategy: BaseStrategy;
    private backtester: BacktestEngine;
    private bestResults: OptimizationResult[];

    constructor(strategy: BaseStrategy, backtester: BacktestEngine) {
        this.logger = Logger.getInstance();
        this.strategy = strategy;
        this.backtester = backtester;
        this.bestResults = [];
    }

    async optimize(config: OptimizationConfig): Promise<OptimizationResult[]> {
        this.logger.info('Starting strategy optimization...');
        const combinations = this.generateParameterCombinations(config.parameterRanges);
        
        for (const params of combinations) {
            try {
                const result = await this.evaluateParameters(params, config);
                this.updateBestResults(result);
                this.logProgress(params, result);
            } catch (error) {
                this.logger.error('Error during parameter evaluation:', error as Error);
            }
        }

        this.logOptimizationResults();
        return this.bestResults;
    }

    private generateParameterCombinations(ranges: OptimizationConfig['parameterRanges']): Record<string, number>[] {
        const combinations: Record<string, number>[] = [];
        const parameters = Object.keys(ranges);
        
        const generateCombination = (index: number, current: Record<string, number>) => {
            if (index === parameters.length) {
                combinations.push({...current});
                return;
            }

            const param = parameters[index];
            const range = ranges[param];
            for (let value = range.min; value <= range.max; value += range.step) {
                current[param] = value;
                generateCombination(index + 1, current);
            }
        };

        generateCombination(0, {});
        return combinations;
    }

    private async evaluateParameters(
        params: Record<string, number>,
        config: OptimizationConfig
    ): Promise<OptimizationResult> {
        // Set strategy parameters
        Object.entries(params).forEach(([key, value]) => {
            (this.strategy as any)[key] = value;
        });

        // Run backtest
        const results = await this.backtester.run();

        // Calculate performance metrics
        const performance = {
            totalPnL: results.totalPnL,
            winRate: results.winRate,
            sharpeRatio: this.calculateSharpeRatio(results.trades),
            maxDrawdown: results.maxDrawdown
        };

        return { parameters: params, performance };
    }

    private calculateSharpeRatio(trades: any[]): number {
        if (trades.length === 0) return 0;

        const returns = trades.map(t => t.pnl);
        const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
        const stdDev = Math.sqrt(
            returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / returns.length
        );

        return stdDev === 0 ? 0 : avgReturn / stdDev;
    }

    private updateBestResults(result: OptimizationResult): void {
        this.bestResults.push(result);
        this.bestResults.sort((a, b) => b.performance.sharpeRatio - a.performance.sharpeRatio);
        
        if (this.bestResults.length > 10) {
            this.bestResults.pop();
        }
    }

    private logProgress(params: Record<string, number>, result: OptimizationResult): void {
        this.logger.info('Parameter evaluation:', {
            parameters: params,
            performance: result.performance
        });
    }

    private logOptimizationResults(): void {
        this.logger.info('Optimization completed. Best results:');
        this.bestResults.forEach((result, index) => {
            this.logger.info(`${index + 1}. Performance:`, {
                parameters: result.parameters,
                metrics: result.performance
            });
        });
    }
}
