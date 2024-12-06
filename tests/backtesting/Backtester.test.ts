import { expect, test, describe } from "bun:test";
import { Backtester } from '../../src/backtesting/Backtester';
import { BreakoutStrategy } from '../../src/strategies/BreakoutStrategy';

describe('Backtester', () => {
    test('should run backtest and generate report', async () => {
        const strategy = new BreakoutStrategy();
        const backtester = new Backtester(strategy, 10000);

        const report = await backtester.runBacktest(
            '2024-01-01',
            '2024-01-07'
        );

        expect(report).toHaveProperty('totalTrades');
        expect(report).toHaveProperty('winRate');
        expect(report).toHaveProperty('totalReturn');
        expect(report.totalTrades).toBeGreaterThan(0);
        expect(report.winRate).toBeGreaterThanOrEqual(0);
        expect(report.winRate).toBeLessThanOrEqual(100);
    });
});
