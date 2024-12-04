export class MarketUtils {
    static calculateRSI(prices: number[], period: number): number {
        if (prices.length < period) return 0;

        let gains = 0;
        let losses = 0;

        for (let i = 1; i < period; i++) {
            const difference = prices[i] - prices[i - 1];
            if (difference > 0) {
                gains += difference;
            } else {
                losses -= difference;
            }
        }

        const averageGain = gains / period;
        const averageLoss = losses / period;

        if (averageLoss === 0) return 100;

        const rs = averageGain / averageLoss;
        return 100 - (100 / (1 + rs));
    }

    static calculateSMA(prices: number[], period: number): number {
        if (prices.length < period) return 0;

        const sum = prices.slice(-period).reduce((acc, price) => acc + price, 0);
        return sum / period;
    }
}
