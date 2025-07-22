import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { join } from "path";

import { MailService } from "./mail.service";

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        transport: {
          host: process.env.EMAIL_HOST,
          port: parseInt(process.env.EMAIL_PORT, 10),
          secure: process.env.EMAIL_SECURE === "true",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
          // Additional options for Gmail SMTP
          tls: {
            // Do not fail on invalid certs
            rejectUnauthorized: false,
          },
          // Enable STARTTLS when secure is false
          requireTLS: process.env.EMAIL_SECURE !== "true",
        },
        defaults: {
          from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
        },
        template: {
          dir: join(__dirname, "templates"),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
