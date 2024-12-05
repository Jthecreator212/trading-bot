import TradingEngine from '../../src/core/Engine';
import { MonitoringService } from '../../src/monitoring/MonitoringService';

describe('System Performance Tests', () => {
    let engine: TradingEngine;
    let monitoringService: MonitoringService;

    beforeEach(() => {
        engine = TradingEngine.getInstance();
        monitoringService = engine.getComponent<MonitoringService>('monitoringService');
    });

    test('should handle multiple concurrent operations', async () => {
        const operations = Array(100).fill(null).map(() => {
            return monitoringService.trackMetric('testMetric', Math.random() * 100);
        });

        await Promise.all(operations);
        expect(monitoringService.getMetrics().has('testMetric')).toBe(true);
    });

    test('should maintain performance under load', () => {
        const startTime = process.hrtime();
        
        for (let i = 0; i < 1000; i++) {
            monitoringService.trackMetric(`metric_${i}`, i);
        }

        const [seconds, nanoseconds] = process.hrtime(startTime);
        const executionTime = seconds * 1000 + nanoseconds / 1000000;
        
        expect(executionTime).toBeLessThan(1000); // Should complete within 1 second
    });
});
