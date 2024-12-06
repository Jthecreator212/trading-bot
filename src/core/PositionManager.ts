export interface Position {
    symbol: string;
    size: number;
    entryPrice: number;
    currentPrice: number;
    unrealizedPnL: number;
}

export class PositionManager {
    private positions: Map<string, Position> = new Map();
    private currentPrice: number = 0;

    constructor() {}

    public updatePrice(price: number): void {
        this.currentPrice = price;
        this.updatePositions();
    }

    public openPosition(symbol: string, size: number, entryPrice: number): void {
        const position: Position = {
            symbol,
            size,
            entryPrice,
            currentPrice: this.currentPrice,
            unrealizedPnL: 0
        };
        this.positions.set(symbol, position);
        this.updatePositions();
    }

    public closePosition(symbol: string): number {
        const position = this.positions.get(symbol);
        if (!position) return 0;

        const pnl = this.calculateUnrealizedPnL(position);
        this.positions.delete(symbol);
        return pnl;
    }

    private updatePositions(): void {
        this.positions.forEach((position, symbol) => {
            position.currentPrice = this.currentPrice;
            position.unrealizedPnL = this.calculateUnrealizedPnL(position);
        });
    }

    private calculateUnrealizedPnL(position: Position): number {
        const priceDiff = this.currentPrice - position.entryPrice;
        return position.size * priceDiff;
    }

    public getPosition(symbol: string): Position | undefined {
        return this.positions.get(symbol);
    }

    public getAllPositions(): Position[] {
        return Array.from(this.positions.values());
    }
}

export default PositionManager;
