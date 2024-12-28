export class Logger {
  static error(message: string, error?: unknown) {
    console.error(`[ERROR] ${message}`, error instanceof Error ? {
      message: error.message,
      stack: error.stack
    } : error);
  }

  static info(message: string, data?: unknown) {
    console.log(`[INFO] ${message}`, data || '');
  }

  static debug(message: string, data?: unknown) {
    console.debug(`[DEBUG] ${message}`, data || '');
  }
}