import { test, expect, describe } from "bun:test";
import { MonitoringService } from '../../src/monitoring/MonitoringService';

describe('MonitoringService', () => {
    let monitoringService: MonitoringService;

    test('setup', () => {
        monitoringService = new MonitoringService();
        expect(monitoringService).toBeDefined();
    });

    test('should start and stop monitoring', () => {
        monitoringService.startMonitoring();
        expect(monitoringService.getMetrics().size).toBe(0); // Initially no metrics

        monitoringService.stopMonitoring();
        expect(monitoringService.getMetrics().size).toBe(0); // Still no metrics after stopping
    });

    test('should track system metrics', async () => {
        monitoringService.startMonitoring();

        // Wait for the monitoring interval to trigger
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

        const metrics = monitoringService.getMetrics();
        expect(metrics.has('system')).toBe(true);

        monitoringService.stopMonitoring();
    });
});
