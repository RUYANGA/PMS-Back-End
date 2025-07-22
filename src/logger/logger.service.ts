import { forwardRef, Inject, Injectable, LoggerService as NestLoggerService } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Writable } from "stream";
import * as winston from "winston";
import * as DailyRotateFile from "winston-daily-rotate-file";

import { MailService } from "../mail/mail.service";

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => MailService))
    private readonly mailService: MailService
  ) {
    const transports: winston.transport[] = [];

    const levelEmojis: Record<string, string> = {
      error: "❗",
      warn: "⚠️",
      info: "✅",
      debug: "🐛",
      verbose: "📢",
    };

    const customFormat = winston.format.printf(({ timestamp, level, message, context }) => {
      const emoji = levelEmojis[level] || "";
      const paddedLevel = level.toUpperCase().padEnd(7);
      const contextStr = context ? `[${context}]` : "";
      return `[${timestamp}] ${emoji} ${paddedLevel} ${contextStr}: ${message}`;
    });

    // Console Transport
    transports.push(
      new winston.transports.Console({
        level: "info",
        format: winston.format.combine(
          winston.format.colorize({ all: true }),
          winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
          customFormat
        ),
      })
    );

    // Daily Rotate File Transport
    transports.push(
      new DailyRotateFile({
        filename: "logs/%DATE%-kangalos.log",
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "14d",
        level: "info",
        format: winston.format.combine(
          winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
          customFormat
        ),
      })
    );

    // Error Log File
    transports.push(
      new DailyRotateFile({
        filename: "logs/%DATE%-error.log",
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "30d",
        level: "error",
        format: winston.format.combine(
          winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
          winston.format.json()
        ),
      })
    );

    // Email Transport for Critical Errors using existing MailService
    const loggerTo = this.configService.get<string>("LOGGER_TO");

    if (loggerTo) {
      const emailStream = new Writable({
        write: (chunk, _encoding, callback) => {
          const message = chunk.toString();
          if (message.includes("error")) {
            this.sendCriticalErrorEmail(loggerTo, message)
              .then(() => callback())
              .catch((err) => {
                console.error("Failed to send critical error email:", err);
                callback();
              });
          } else {
            callback();
          }
        },
      });

      transports.push(
        new winston.transports.Stream({
          stream: emailStream,
          level: "error",
        })
      );
    } else {
      console.warn("LOGGER_TO not configured. Critical errors will not trigger emails.");
    }

    this.logger = winston.createLogger({
      level: this.configService.get<string>("LOG_LEVEL") || "info",
      transports,
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(`${message} ${trace ? `\nTrace: ${trace}` : ""}`, {
      context,
    });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }

  private async sendCriticalErrorEmail(to: string, rawMessage: string): Promise<void> {
    const appName = this.configService.get<string>("APP_NAME") || "Kangalos";

    try {
      await this.mailService.sendCriticalErrorEmail(to, rawMessage, appName);
    } catch (error) {
      console.error("Failed to send critical error email:", error);
      throw error;
    }
  }
}
