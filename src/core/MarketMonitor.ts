   import { EventEmitter } from 'events';
   import { Logger } from './Logger';
   import { MarketDepth } from './MarketDepth';
   import { WebSocketManager } from './WebSocketManager';

   export class MarketMonitor extends EventEmitter {
       private logger: Logger;
       private marketDepth: MarketDepth;
       private wsManager: WebSocketManager;
       private symbols: Map<string, any>;
       private intervals: Map<string, NodeJS.Timeout>;

       constructor(logger: Logger, marketDepth: MarketDepth, wsManager: WebSocketManager) {
           super();
           this.logger = logger;
           this.marketDepth = marketDepth;
           this.wsManager = wsManager;
           this.symbols = new Map();
           this.intervals = new Map();
       }

       public addSymbol(symbol: string, interval: number): void {
           this.symbols.set(symbol, { interval });
           this.startMonitoring(symbol);
           this.logger.info(`Started monitoring ${symbol}`);
       }

       private startMonitoring(symbol: string): void {
           const config = this.symbols.get(symbol);
           const intervalId = setInterval(async () => {
               try {
                   const marketData = await this.marketDepth.getDepth(symbol);
                   this.emit('marketUpdate', { symbol, data: marketData });
               } catch (error) {
                   this.logger.error(`Error monitoring ${symbol}: ${error.message}`);
               }
           }, config.interval);

           this.intervals.set(symbol, intervalId);
       }

       public stopMonitoring(symbol: string): void {
           const intervalId = this.intervals.get(symbol);
           if (intervalId) {
               clearInterval(intervalId);
               this.intervals.delete(symbol);
               this.symbols.delete(symbol);
               this.logger.info(`Stopped monitoring ${symbol}`);
           }
       }

       public stopAll(): void {
           this.symbols.forEach((_, symbol) => this.stopMonitoring(symbol));
       }
   }
