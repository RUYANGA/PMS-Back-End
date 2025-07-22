import { forwardRef, Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { MailModule } from "../mail/mail.module";
import { LoggerService } from "./logger.service";

@Global()
@Module({
  imports: [ConfigModule, forwardRef(() => MailModule)],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
