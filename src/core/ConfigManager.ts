export class ConfigManager {
    private config: any;

    constructor() {
        try {
            this.config = require('../../config.json');
        } catch (error) {
            console.error('Failed to load config:', error);
            this.config = {};
        }
    }

    public get(key: string): any {
        return this.config[key];
    }

    public set(key: string, value: any): void {
        this.config[key] = value;
    }
}

export default ConfigManager;
