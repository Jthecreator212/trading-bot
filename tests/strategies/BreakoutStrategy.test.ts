import { expect, test, describe, beforeEach } from "bun:test";
import { BreakoutStrategy } from '../../src/strategies/BreakoutStrategy';

describe('BreakoutStrategy', () => {
    let strategy: BreakoutStrategy;

    beforeEach(() => {
        strategy = new BreakoutStrategy();
    });

    test('getMultiTimeframeData returns correct structure', async () => {
        const data = await (strategy as any).getMultiTimeframeData();
        expect(data).toHaveProperty('dailyData');
        expect(data).toHaveProperty('hourlyData');
    });

    test('analyze returns valid signal format', async () => {
        const signal = await strategy.analyze();
        expect(signal).toHaveProperty('type');
        expect(['LONG', 'SHORT', 'NONE']).toContain(signal.type);
        
        if (signal.type !== 'NONE') {
            expect(signal).toHaveProperty('entry');
            expect(typeof signal.entry).toBe('number');
        }
    });
});
