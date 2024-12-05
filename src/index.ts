import TradingEngine from './core/Engine';
import { Logger } from './core/Logger';
import { BinanceProvider } from './providers/BinanceProvider';
import { RiskManager } from './core/RiskManager';
import { ExampleStrategy } from './strategies/ExampleStrategy';

async function main() {
    const engine = TradingEngine.getInstance();
    const logger = engine.getComponent<Logger>('logger');
    const riskManager = engine.getComponent<RiskManager>('riskManager');
    const provider = new BinanceProvider();

    logger.info('Trading Bot Starting...');

    try {
        // Set up risk parameters
        riskManager.setRiskParameters({
            maxPositionSize: 1000,
            maxDrawdownPercent: 2,
            stopLossPercent: 1,
            takeProfitPercent: 2
        });

        // Initialize strategies with market pairs
        const strategies = [
            new ExampleStrategy('BTCUSDT', 60000, 10000),
            new ExampleStrategy('ETHUSDT', 60000, 5000)
        ];

        // Register strategy event handlers
        strategies.forEach(strategy => {
            strategy.on('analysisComplete', (signal) => {
                logger.info(`Analysis complete for ${signal.symbol}: ${signal.signal}`);
                if (signal.signal !== 'hold') {
                    strategy.execute();
                }
            });

            strategy.on('orderExecuted', (order) => {
                logger.info(`Order executed: ${JSON.stringify(order)}`);
            });
        });

        // Start the engine
        engine.start();

        // Handle shutdown gracefully
        process.on('SIGINT', () => {
            logger.info('Shutting down...');
            engine.stop();
            process.exit(0);
        });

    } catch (error) {
        logger.error('Error starting trading bot:', error);
        process.exit(1);
    }
}

main().catch(console.error);
