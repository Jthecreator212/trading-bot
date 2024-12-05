import { test, expect, describe } from "bun:test";
import { WebSocketManager } from '../../src/core/WebSocketManager';

describe('WebSocketManager', () => {
    let wsManager: WebSocketManager;

    test('setup', () => {
        wsManager = new WebSocketManager();
        expect(wsManager).toBeDefined();
    });

    test('connect and disconnect', async () => {
        const testUrl = 'wss://stream.binance.com:9443/ws';
        const testSymbol = 'BTCUSDT';
        
        wsManager.connect(testUrl, testSymbol);
        
        // Wait for potential connection
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const connections = wsManager.getConnections();
        expect(Array.isArray(connections)).toBe(true);
        
        wsManager.disconnect(testSymbol);
        expect(wsManager.isConnected(testSymbol)).toBe(false);
    });

    test('invalid url handling', () => {
        const invalidUrl = 'not-a-valid-url';
        const testSymbol = 'BTCUSDT';
        
        wsManager.connect(invalidUrl, testSymbol);
        expect(wsManager.isConnected(testSymbol)).toBe(false);
    });
});
