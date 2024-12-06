export class DataRecorder {
    private dataManager: any;

    constructor() {
        this.dataManager = new DataManager();
    }

    async fetchData() {
        try {
            const data = await this.dataManager.fetchCandles({
                symbol: 'BTCUSDT',
                interval: '1h',
                limit: 100
            });
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }
}
