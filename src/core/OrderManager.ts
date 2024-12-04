import { Logger } from './Logger';
import { BinanceProvider } from '../providers/BinanceProvider';

export interface Order {
    id: string;
    symbol: string;
    side: 'BUY' | 'SELL';
    type: 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'TAKE_PROFIT';
    quantity: number;
    price: number;
    status: 'PENDING' | 'FILLED' | 'CANCELLED' | 'REJECTED';
    timestamp: number;
}

export class OrderManager {
    private logger: Logger;
    private provider: BinanceProvider;
    private orders: Map<string, Order>;
    private activeOrders: Map<string, Order>;

    constructor(provider: BinanceProvider) {
        this.logger = Logger.getInstance();
        this.provider = provider;
        this.orders = new Map();
        this.activeOrders = new Map();
    }

    async createOrder(params: Omit<Order, 'id' | 'status' | 'timestamp'>): Promise<Order | null> {
        try {
            const orderId = this.generateOrderId();
            const order: Order = {
                ...params,
                id: orderId,
                status: 'PENDING',
                timestamp: Date.now()
            };

            this.orders.set(orderId, order);
            this.activeOrders.set(orderId, order);

            this.logger.info(`Created ${order.type} ${order.side} order for ${order.symbol}`, order);

            // Execute the order
            const success = await this.provider.executeOrder(order);
            if (success) {
                order.status = 'FILLED';
                this.activeOrders.delete(orderId);
                this.logger.info(`Order ${orderId} filled successfully`);
            } else {
                order.status = 'REJECTED';
                this.activeOrders.delete(orderId);
                this.logger.error(`Order ${orderId} rejected`);
            }

            return order;
        } catch (error) {
            this.logger.error('Error creating order:', error as Error);
            return null;
        }
    }

    async cancelOrder(orderId: string): Promise<boolean> {
        const order = this.activeOrders.get(orderId);
        if (!order) {
            this.logger.warn(`Order ${orderId} not found or already filled/cancelled`);
            return false;
        }

        try {
            // Implement cancel logic with provider
            order.status = 'CANCELLED';
            this.activeOrders.delete(orderId);
            this.logger.info(`Order ${orderId} cancelled successfully`);
            return true;
        } catch (error) {
            this.logger.error(`Error cancelling order ${orderId}:`, error as Error);
            return false;
        }
    }

    getOrder(orderId: string): Order | undefined {
        return this.orders.get(orderId);
    }

    getActiveOrders(): Order[] {
        return Array.from(this.activeOrders.values());
    }

    getOrderHistory(symbol?: string): Order[] {
        const allOrders = Array.from(this.orders.values());
        if (symbol) {
            return allOrders.filter(order => order.symbol === symbol);
        }
        return allOrders;
    }

    private generateOrderId(): string {
        return `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
