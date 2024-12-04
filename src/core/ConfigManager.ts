import { Logger } from './Logger';
import * as fs from 'fs/promises';

interface Config {
    exchange: string;
    apiKey?: string;
    apiSecret?: string;
    pairs: string[];
    intervals: {
        default: number;
    };
    risk: {
        maxPositionSize: number;
        maxDrawdownPercent: number;
        stopLossPercent: number;
        takeProfitPercent: number;
    };
}

export class ConfigManager {
    private static instance: ConfigManager;
    private logger: Logger;
    private config: Config | null = null;

    private constructor() {
        this.logger = Logger.getInstance();
    }

    static getInstance(): ConfigManager {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }

    async loadConfig(path: string): Promise<void> {
        try {
            const configFile = await fs.readFile(path, 'utf-8');
            this.config = JSON.parse(configFile);
            this.logger.info('Configuration loaded successfully');
        } catch (error) {
            this.logger.error('Error loading configuration:', error as Error);
            // Set default configuration
            this.config = {
                exchange: 'binance',
                pairs: ['BTCUSDT', 'ETHUSDT'],
                intervals: {
                    default: 60000
                },
                risk: {
                    maxPositionSize: 1000,
                    maxDrawdownPercent: 2,
                    stopLossPercent: 1,
                    takeProfitPercent: 2
                }
            };
            this.logger.info('Using default configuration');
        }
    }

    getConfig(): Config {
        if (!this.config) {
            throw new Error('Configuration not loaded');
        }
        return this.config;
    }

    getPairs(): string[] {
        return this.getConfig().pairs;
    }

    getDefaultInterval(): number {
        return this.getConfig().intervals.default;
    }

    getRiskParameters() {
        return this.getConfig().risk;
    }
}
