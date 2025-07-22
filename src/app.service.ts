import { Injectable } from "@nestjs/common";

import { MailService } from "./mail/mail.service";

@Injectable()
export class AppService {
  constructor(private readonly mailService: MailService) {}

  getHello(): string {
    const appName = process.env.APP_NAME ?? "App";
    const welcomeMessage = `Welcome to ${appName}! We're glad to have you here.`;
    return welcomeMessage;
  }

  getHealth(): { status: string; timestamp: string } {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }

  // Example method to demonstrate global MailService usage
  async sendExampleWelcomeEmail(
    email: string,
    name: string
  ): Promise<{ success: boolean; message: string }> {
    const confirmUrl = `https://yourapp.com/confirm?token=example123`;
    return await this.mailService.sendWelcomeEmail(email, name, confirmUrl);
  }
}
