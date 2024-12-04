import { TradingEngine } from './core/Engine';
import { Logger } from './core/Logger';
import { BinanceProvider } from './providers/BinanceProvider';
import { RiskManager } from './core/RiskManager';

async function main() {
    const logger = Logger.getInstance();
    const provider = new BinanceProvider();
    const riskManager = RiskManager.getInstance();
    
    logger.info('Trading Bot Starting...');

    try {
        // Set up risk parameters
        riskManager.setRiskParameters({
            maxPositionSize: 1000,
            maxDrawdownPercent: 2,
            stopLossPercent: 1,
            takeProfitPercent: 2
        });

        const engine = new TradingEngine();

        const tradingPairs = [
            { symbol: 'BTCUSDT', interval: 60000, minVolume: 10000 },
            { symbol: 'ETHUSDT', interval: 60000, minVolume: 5000 }
        ];

        await engine.start();

        process.on('SIGINT', async () => {
            logger.info('Initiating graceful shutdown...');
            await engine.stop();
            process.exit(0);
        });

    } catch (error) {
        logger.error('Fatal error:', error as Error);
        process.exit(1);
    }
}

main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
});
