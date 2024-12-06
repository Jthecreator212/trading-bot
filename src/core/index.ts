import { Engine } from './core/Engine';
import { MarketData, TradingSignal } from './types';
import { Logger } from './core/Logger';

async function main() {
    const engine = new Engine();
    const logger = new Logger();
    
    try {
        // Start the engine
        await engine.start();
        console.log('Trading bot started successfully');

        // Get market data agent after engine has started
        const marketDataAgent = engine.getComponent('marketDataAgent');
        if (!marketDataAgent) {
            throw new Error('MarketDataAgent not initialized');
        }

        // Add market data event listeners
        marketDataAgent.on('marketData', (data: MarketData) => {
            console.log('\n=== Market Update ===');
            console.log(`Symbol: ${data.symbol}`);
            console.log(`Price: ${data.price}`);
            console.log(`Volume: ${data.volume}`);
            console.log(`RSI: ${data.rsi?.toFixed(2) || 'N/A'}`);
            console.log('MACD:');
            console.log(`  Line: ${data.macd?.macd?.toFixed(2) || '0.00'}`);
            console.log(`  Signal: ${data.macd?.signal?.toFixed(2) || '0.00'}`);
            console.log(`  Histogram: ${data.macd?.histogram?.toFixed(2) || '0.00'}`);
            console.log(`EMA20: ${data.ema?.ema20?.toFixed(2) || 'N/A'}`);
            console.log(`EMA50: ${data.ema?.ema50?.toFixed(2) || 'N/A'}`);
            console.log(`VWAP: ${data.vwap?.toFixed(2) || 'N/A'}`);
            console.log('===================\n');
        });

        // Add trading signal event listeners
        marketDataAgent.on('tradingSignal', (signal: TradingSignal) => {
            console.log('\n=== Trading Signal ===');
            console.log(`Type: ${signal.type}`);
            console.log(`Symbol: ${signal.symbol}`);
            console.log(`Price: ${signal.price}`);
            console.log(`Confidence: ${signal.confidence}`);
            console.log('=====================\n');
        });

        // Add error event listeners
        marketDataAgent.on('error', (error: Error) => {
            logger.error('Market data error:', error);
        });

        // Handle process termination
        process.on('SIGINT', async () => {
            console.log('\nGracefully shutting down...');
            await engine.stop();
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            console.log('\nGracefully shutting down...');
            await engine.stop();
            process.exit(0);
        });

    } catch (error) {
        logger.error('Failed to start trading bot:', error);
        process.exit(1);
    }
}

// Add error handling for uncaught exceptions
process.on('uncaughtException', (error: Error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (error: Error) => {
    console.error('Unhandled Rejection:', error);
    process.exit(1);
});

main().catch(console.error);
