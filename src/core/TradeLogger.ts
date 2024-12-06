import { MarketData } from '../types';

export class TradeLogger {
    private logs: any[] = [];

    public logMarketData(data: MarketData): void {
        this.logs.push({
            timestamp: new Date().toISOString(),
            type: 'MARKET_DATA',
            data
        });
    }

    public getLogs(): any[] {
        return this.logs;
    }
}

export default TradeLogger;
