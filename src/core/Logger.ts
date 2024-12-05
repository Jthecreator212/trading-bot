   export class Logger {
       private static instance: Logger;

       private constructor() {}

       public static getInstance(): Logger {
           if (!Logger.instance) {
               Logger.instance = new Logger();
           }
           return Logger.instance;
       }

       public info(message: string, ...args: any[]): void {
           console.log(`[${new Date().toISOString()}] INFO: ${message}`, ...args);
       }

       public error(message: string, ...args: any[]): void {
           console.error(`[${new Date().toISOString()}] ERROR: ${message}`, ...args);
       }

       public warn(message: string, ...args: any[]): void {
           console.warn(`[${new Date().toISOString()}] WARN: ${message}`, ...args);
       }
   }
