   export class Logger {
       private static instance: Logger;

       private constructor() {}

       static getInstance(): Logger {
           if (!Logger.instance) {
               Logger.instance = new Logger();
           }
           return Logger.instance;
       }

       info(message: string, context?: any): void {
           console.log(`[${new Date().toISOString()}] INFO: ${message}`, context || '');
       }

       error(message: string, error: Error): void {
           console.error(`[${new Date().toISOString()}] ERROR: ${message}`, error);
       }
   }
