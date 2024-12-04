   import { BaseStrategy } from './BaseStrategy';
   import { MarketData, Order } from '../types';
   import { MarketUtils } from '../utils/market';
   import { BaseProvider } from '../providers/BaseProvider';

   export class ExampleStrategy extends BaseStrategy {
       private prices: number[] = [];
       private readonly rsiPeriod: number = 14;
       private readonly overbought: number = 70;
       private readonly oversold: number = 30;
       private provider: BaseProvider;

       constructor(name: string, interval: number, provider: BaseProvider) {
           super(name, interval);
           this.provider = provider;
       }

       async execute(): Promise<void> {
           try {
               const data = await this.provider.getMarketData(this.name);
               this.prices.push(data.price);

               // Keep only necessary price history
               if (this.prices.length > this.rsiPeriod + 1) {
                   this.prices.shift();
               }

               if (this.prices.length <= this.rsiPeriod) {
                   return;
               }

               const rsi = MarketUtils.calculateRSI(this.prices, this.rsiPeriod);

               let order: Order | null = null;

               // Generate signals
               if (rsi < this.oversold) {
                   order = {
                       symbol: data.symbol,
                       side: 'BUY',
                       quantity: 1, // Define your position sizing logic
                       price: data.price,
                       type: 'MARKET'
                   };
               } else if (rsi > this.overbought) {
                   order = {
                       symbol: data.symbol,
                       side: 'SELL',
                       quantity: 1, // Define your position sizing logic
                       price: data.price,
                       type: 'MARKET'
                   };
               }

               if (order) {
                   const success = await this.provider.executeOrder(order);
                   if (success) {
                       console.log(`Order executed: ${order.side} ${order.quantity} ${order.symbol} at ${order.price}`);
                   } else {
                       console.log('Order execution failed');
                   }
               }
           } catch (error) {
               console.error(`Error executing strategy: ${error}`);
           }
       }
   }
