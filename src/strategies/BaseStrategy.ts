import { EventEmitter } from 'events';
import { Logger } from '../core/Logger';

export abstract class BaseStrategy extends EventEmitter {
    protected logger: Logger;
    protected symbol: string;
    protected interval: number;
    protected isRunning: boolean = false;

    constructor(symbol: string, interval: number) {
        super();
        this.logger = Logger.getInstance();
        this.symbol = symbol;
        this.interval = interval;
    }

    getName(): string {
        return this.symbol;
    }

    abstract execute(): Promise<void>;

    protected async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    stop(): void {
        this.isRunning = false;
        this.logger.info(`Strategy stopped for ${this.symbol}`);
    }
}
