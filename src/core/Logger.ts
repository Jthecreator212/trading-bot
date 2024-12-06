export class Logger {
    constructor() {}

    public info(message: string, ...args: any[]): void {
        this.log('INFO', message, ...args);
    }

    public error(message: string, ...args: any[]): void {
        this.log('ERROR', message, ...args);
    }

    public warn(message: string, ...args: any[]): void {
        this.log('WARN', message, ...args);
    }

    public debug(message: string, ...args: any[]): void {
        this.log('DEBUG', message, ...args);
    }

    private log(level: string, message: string, ...args: any[]): void {
        const timestamp = new Date().toISOString();
        const formattedArgs = args.length > 0 ? JSON.stringify(args) : '';
        console.log(`[${timestamp}] ${level}: ${message} ${formattedArgs}`);
    }
}

export default Logger;
