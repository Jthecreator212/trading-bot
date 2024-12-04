import { Logger } from './Logger';

interface SentimentSource {
    name: string;
    weight: number;
    sentiment: number;  // -1 to 1 (bearish to bullish)
    timestamp: number;
}

interface SentimentAnalysis {
    symbol: string;
    overallSentiment: number;
    confidence: number;
    sources: SentimentSource[];
    timestamp: number;
}

export class MarketSentimentAnalyzer {
    private static instance: MarketSentimentAnalyzer;
    private logger: Logger;
    private sentimentData: Map<string, SentimentAnalysis>;
    private updateInterval: NodeJS.Timer | null;

    private constructor() {
        this.logger = Logger.getInstance();
        this.sentimentData = new Map();
        this.updateInterval = null;
        this.startPeriodicUpdate();
    }

    static getInstance(): MarketSentimentAnalyzer {
        if (!MarketSentimentAnalyzer.instance) {
            MarketSentimentAnalyzer.instance = new MarketSentimentAnalyzer();
        }
        return MarketSentimentAnalyzer.instance;
    }

    async analyzeSentiment(symbol: string): Promise<SentimentAnalysis> {
        try {
            const sources = await this.gatherSentimentData(symbol);
            const analysis = this.calculateOverallSentiment(symbol, sources);
            this.sentimentData.set(symbol, analysis);
            this.logSentimentAnalysis(analysis);
            return analysis;
        } catch (error) {
            this.logger.error(`Error analyzing sentiment for ${symbol}:`, error as Error);
            throw error;
        }
    }

    private async gatherSentimentData(symbol: string): Promise<SentimentSource[]> {
        const sources: SentimentSource[] = [];

        // Technical Indicators Sentiment
        sources.push(await this.analyzeTechnicalSentiment(symbol));

        // Social Media Sentiment
        sources.push(await this.analyzeSocialMediaSentiment(symbol));

        // News Sentiment
        sources.push(await this.analyzeNewsSentiment(symbol));

        // Market Data Sentiment
        sources.push(await this.analyzeMarketDataSentiment(symbol));

        return sources;
    }

    private calculateOverallSentiment(symbol: string, sources: SentimentSource[]): SentimentAnalysis {
        const totalWeight = sources.reduce((sum, source) => sum + source.weight, 0);
        const weightedSentiment = sources.reduce((sum, source) => sum + (source.sentiment * source.weight), 0);
        const overallSentiment = weightedSentiment / totalWeight;

        // Calculate confidence based on source agreement
        const sentimentVariance = this.calculateSentimentVariance(sources, overallSentiment);
        const confidence = 1 - Math.min(sentimentVariance, 1);

        return {
            symbol,
            overallSentiment,
            confidence,
            sources,
            timestamp: Date.now()
        };
    }

    private calculateSentimentVariance(sources: SentimentSource[], meanSentiment: number): number {
        const squaredDiffs = sources.map(source => 
            Math.pow(source.sentiment - meanSentiment, 2) * source.weight
        );
        return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / sources.length;
    }

    private async analyzeTechnicalSentiment(symbol: string): Promise<SentimentSource> {
        // Implement technical analysis sentiment calculation
        return {
            name: 'Technical Indicators',
            weight: 0.4,
            sentiment: 0, // Replace with actual calculation
            timestamp: Date.now()
        };
    }

    private async analyzeSocialMediaSentiment(symbol: string): Promise<SentimentSource> {
        // Implement social media sentiment analysis
        return {
            name: 'Social Media',
            weight: 0.2,
            sentiment: 0, // Replace with actual calculation
            timestamp: Date.now()
        };
    }

    private async analyzeNewsSentiment(symbol: string): Promise<SentimentSource> {
        // Implement news sentiment analysis
        return {
            name: 'News',
            weight: 0.25,
            sentiment: 0, // Replace with actual calculation
            timestamp: Date.now()
        };
    }

    private async analyzeMarketDataSentiment(symbol: string): Promise<SentimentSource> {
        // Implement market data sentiment analysis
        return {
            name: 'Market Data',
            weight: 0.15,
            sentiment: 0, // Replace with actual calculation
            timestamp: Date.now()
        };
    }

    private startPeriodicUpdate(): void {
        this.updateInterval = setInterval(() => {
            for (const symbol of this.sentimentData.keys()) {
                this.analyzeSentiment(symbol).catch(error => {
                    this.logger.error(`Error updating sentiment for ${symbol}:`, error);
                });
            }
        }, 300000); // Update every 5 minutes
    }

    private logSentimentAnalysis(analysis: SentimentAnalysis): void {
        this.logger.info(`Sentiment Analysis for ${analysis.symbol}:`, {
            sentiment: analysis.overallSentiment.toFixed(2),
            confidence: analysis.confidence.toFixed(2),
            sources: analysis.sources.map(s => ({
                name: s.name,
                sentiment: s.sentiment.toFixed(2)
            }))
        });
    }

    getSentiment(symbol: string): SentimentAnalysis | undefined {
        return this.sentimentData.get(symbol);
    }

    stop(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}
