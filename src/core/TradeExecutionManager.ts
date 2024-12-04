import { Logger } from './Logger';
import { OrderManager, Order } from './OrderManager';
import { BinanceProvider } from '../providers/BinanceProvider';

export class TradeExecutionManager {
    private logger: Logger;
    private orderManager: OrderManager;
    private provider: BinanceProvider;

    constructor(provider: BinanceProvider) {
        this.logger = Logger.getInstance();
        this.orderManager = new OrderManager(provider);
        this.provider = provider;
    }

    async executeTrade(symbol: string, side: 'BUY' | 'SELL', quantity: number, price: number): Promise<Order | null> {
        try {
            const orderType = 'MARKET'; // For simplicity, using market orders
            const order: Omit<Order, 'id' | 'status' | 'timestamp'> = {
                symbol,
                side,
                type: orderType,
                quantity,
                price
            };

            const executedOrder = await this.orderManager.createOrder(order);
            if (executedOrder && executedOrder.status === 'FILLED') {
                this.logger.info(`Trade executed successfully: ${symbol} ${side} ${quantity} at ${price}`);
                return executedOrder;
            } else {
                this.logger.warn(`Trade execution failed for ${symbol} ${side} ${quantity} at ${price}`);
                return null;
            }
        } catch (error) {
            this.logger.error(`Error executing trade for ${symbol}:`, error as Error);
            return null;
        }
    }

    async cancelTrade(orderId: string): Promise<boolean> {
        try {
            const success = await this.orderManager.cancelOrder(orderId);
            if (success) {
                this.logger.info(`Order ${orderId} cancelled successfully`);
            } else {
                this.logger.warn(`Failed to cancel order ${orderId}`);
            }
            return success;
        } catch (error) {
            this.logger.error(`Error cancelling order ${orderId}:`, error as Error);
            return false;
        }
    }

    async getActiveOrders(): Promise<Order[]> {
        return this.orderManager.getActiveOrders();
    }

    async getOrderHistory(symbol: string): Promise<Order[]> {
        return this.orderManager.getOrderHistory(symbol);
    }
}
