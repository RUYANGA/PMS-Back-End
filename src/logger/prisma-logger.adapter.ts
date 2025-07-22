import { LoggerService } from "./logger.service";

export class PrismaLoggerAdapter {
  constructor(private readonly logger: LoggerService) {}

  logQuery(query: string, duration: number, params?: any) {
    this.logger.debug(
      `PRISMA QUERY (${duration}ms): ${query} -- ${JSON.stringify(params)}`,
      "PrismaClient"
    );
  }

  logQueryError(error: string, query: string, params?: any) {
    this.logger.error(
      `PRISMA QUERY ERROR: ${error} -- ${query} -- ${JSON.stringify(params)}`,
      null,
      "PrismaClient"
    );
  }

  logQuerySlow(duration: number, query: string, params?: any) {
    this.logger.warn(
      `PRISMA SLOW QUERY (${duration}ms): ${query} -- ${JSON.stringify(params)}`,
      "PrismaClient"
    );
  }

  logInfo(message: string) {
    this.logger.log(`PRISMA INFO: ${message}`, "PrismaClient");
  }

  logWarn(message: string) {
    this.logger.warn(`PRISMA WARNING: ${message}`, "PrismaClient");
  }

  logError(message: string) {
    this.logger.error(`PRISMA ERROR: ${message}`, null, "PrismaClient");
  }
}
