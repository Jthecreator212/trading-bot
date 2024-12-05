import { AdvancedStrategy } from '../../src/strategies/AdvancedStrategy';

describe('AdvancedStrategy', () => {
    let strategy: AdvancedStrategy;

    beforeEach(() => {
        strategy = new AdvancedStrategy('BTCUSDT', 60000, 10000);
    });

    test('should analyze market data', async () => {
        const mockData = { 
            price: 50000, 
            volume: 15000 
        };
        
        await strategy.analyze(mockData);
        expect(strategy).toBeDefined();
    });

    test('should execute trade', async () => {
        // Mock the provider's getMarketData method
        jest.spyOn(strategy['provider'], 'getMarketData').mockResolvedValue({
            price: 50000,
            volume: 15000
        });

        await strategy.execute();
        expect(strategy).toBeDefined();
    });
});
