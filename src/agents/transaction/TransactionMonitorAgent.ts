import { EventEmitter } from 'events';

export class TransactionMonitorAgent extends EventEmitter {
    private id: string;
    private interval: number;

    constructor(id: string, interval: number) {
        super();
        this.id = id;
        this.interval = interval;
    }

    async start(): Promise<void> {
        console.log(`[${this.id}] Transaction monitoring started`);
    }

    async stop(): Promise<void> {
        console.log(`[${this.id}] Transaction monitoring stopped`);
    }
}
