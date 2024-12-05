import { EventEmitter } from 'events';
import { Logger } from '../core/Logger';

export abstract class BaseStrategy extends EventEmitter {
    protected symbol: string;
    protected interval: number;
    protected minVolume: number;
    protected logger: Logger;

    constructor(symbol: string, interval: number, minVolume: number) {
        super();
        this.symbol = symbol;
        this.interval = interval;
        this.minVolume = minVolume;
        this.logger = new Logger();
    }

    abstract analyze(data: any): Promise<void>;
    abstract execute(): Promise<void>;

    protected log(message: string): void {
        this.logger.info(`[${this.symbol}] ${message}`);
    }
}
