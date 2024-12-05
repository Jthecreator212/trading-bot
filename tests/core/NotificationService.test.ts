import { test, expect } from "bun:test";
import { NotificationService } from '../../src/core/NotificationService';

let notificationService: NotificationService;

test("NotificationService setup", () => {
    notificationService = new NotificationService();
    expect(notificationService).toBeDefined();
});

test("NotificationService should send info alert", () => {
    let alertReceived: any = null;
    notificationService.on('alert', (alert) => {
        alertReceived = alert;
    });

    notificationService.sendAlert('Test info alert');
    
    expect(alertReceived).toBeDefined();
    expect(alertReceived.level).toBe('info');
    expect(alertReceived.message).toBe('Test info alert');
    expect(typeof alertReceived.timestamp).toBe('string');
});

test("NotificationService should send trade notification", () => {
    let tradeReceived: any = null;
    notificationService.on('tradeNotification', (trade) => {
        tradeReceived = trade;
    });

    const trade = { id: 1, symbol: 'BTCUSDT', price: 50000 };
    notificationService.sendTradeNotification(trade);
    
    expect(tradeReceived).toBeDefined();
    expect(tradeReceived.id).toBe(trade.id);
    expect(tradeReceived.symbol).toBe(trade.symbol);
    expect(tradeReceived.price).toBe(trade.price);
    expect(typeof tradeReceived.timestamp).toBe('string');
});
