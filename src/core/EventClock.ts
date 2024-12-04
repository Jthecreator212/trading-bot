import { EventEmitter } from 'events';

export class EventClock extends EventEmitter {
    private interval: number;
    private running: boolean = false;

    constructor(interval: number) {
        super();
        this.interval = interval;
    }

    start(): void {
        this.running = true;
        this.tick();
    }

    stop(): void {
        this.running = false;
    }

    private tick(): void {
        if (!this.running) return;
        
        this.emit('tick', Date.now());
        setTimeout(() => this.tick(), this.interval);
    }
}
