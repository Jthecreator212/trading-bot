import { MarketData } from '../../types';

export interface MarketRegime {
    regime: 'TRENDING' | 'RANGING' | 'VOLATILE' | 'QUIET';
    confidence: number;
    recommendations: string[];
}

export class MarketRegimeAnalyzer {
    private readonly volatilityWindow = 20;
    private readonly trendWindow = 50;

    public analyzeMarketConditions(data: MarketData[]): MarketRegime {
        const volatility = this.calculateVolatility(data);
        const trend = this.analyzeTrendStrength(data);
        const volume = this.analyzeVolumeProfile(data);
        
        return {
            regime: this.determineRegime(volatility, trend, volume),
            confidence: this.calculateConfidence(volatility, trend, volume),
            recommendations: this.generateRecommendations(volatility, trend, volume)
        };
    }

    private calculateVolatility(data: MarketData[]): number {
        if (data.length < this.volatilityWindow) return 0;

        const returns = data.slice(-this.volatilityWindow).map((d, i, arr) => {
            if (i === 0) return 0;
            return (d.close - arr[i-1].close) / arr[i-1].close;
        });

        const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
        
        return Math.sqrt(variance);
    }

    private analyzeTrendStrength(data: MarketData[]): number {
        if (data.length < this.trendWindow) return 0;

        const prices = data.slice(-this.trendWindow).map(d => d.close);
        const firstHalf = prices.slice(0, this.trendWindow/2);
        const secondHalf = prices.slice(-this.trendWindow/2);

        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

        return (secondAvg - firstAvg) / firstAvg;
    }

    private analyzeVolumeProfile(data: MarketData[]): number {
        const recentVolumes = data.slice(-this.volatilityWindow).map(d => d.volume);
        const avgVolume = recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;
        const latestVolume = recentVolumes[recentVolumes.length - 1];

        return latestVolume / avgVolume;
    }

    private determineRegime(volatility: number, trend: number, volume: number): MarketRegime['regime'] {
        if (volatility > 0.02 && Math.abs(trend) > 0.01) return 'VOLATILE';
        if (Math.abs(trend) > 0.005) return 'TRENDING';
        if (volatility < 0.005) return 'QUIET';
        return 'RANGING';
    }

    private calculateConfidence(volatility: number, trend: number, volume: number): number {
        // Calculate confidence score (0-100)
        let confidence = 50;
        
        if (volume > 1.5) confidence += 20;
        if (Math.abs(trend) > 0.01) confidence += 15;
        if (volatility < 0.01) confidence += 15;

        return Math.min(100, confidence);
    }

    private generateRecommendations(volatility: number, trend: number, volume: number): string[] {
        const recommendations: string[] = [];

        if (volatility > 0.02) {
            recommendations.push('Reduce position sizes');
            recommendations.push('Widen stop losses');
        }

        if (Math.abs(trend) > 0.01) {
            recommendations.push('Use trend-following strategies');
            if (trend > 0) {
                recommendations.push('Look for pullback entries');
            } else {
                recommendations.push('Consider short positions');
            }
        }

        if (volume > 1.5) {
            recommendations.push('Monitor for breakouts');
        }

        return recommendations;
    }
}

export default MarketRegimeAnalyzer;
