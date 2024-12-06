import { expect, test, describe } from "bun:test";
import { PositionManager } from '../../src/core/PositionManager';

describe('PositionManager', () => {
    test('should calculate correct position size', () => {
        const manager = new PositionManager(0.02); // 2% risk
        const size = manager.calculatePositionSize(
            50000, // entry
            49000, // stop loss
            100000 // account balance
        );
        expect(size).toBe(2); // $2000 risk / $1000 stop distance = 2 units
    });

    test('should open and close positions', async () => {
        const manager = new PositionManager();
        const signal = {
            symbol: 'BTCUSDT',
            type: 'LONG' as const,
            entry: 50000,
            stopLoss: 49000
        };

        const position = await manager.openPosition(signal, 100000);
        expect(position.symbol).toBe('BTCUSDT');
        
        const closed = await manager.closePosition('BTCUSDT', 51000);
        expect(closed?.pnl).toBeGreaterThan(0);
    });
});
