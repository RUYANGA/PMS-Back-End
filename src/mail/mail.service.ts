import { Injectable, Logger } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";

export interface MailOptions {
  to: string | string[];
  subject: string;
  template: string;
  context?: Record<string, any>;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content?: any;
    path?: string;
    contentType?: string;
    cid?: string;
  }>;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  /**
   * Send an email using a template
   * @param options Mail options including recipient, subject, template name, and context data
   * @returns Promise resolving to success message or rejecting with error
   */
  async sendMail(options: MailOptions): Promise<{ success: boolean; message: string }> {
    try {
      const { to, subject, template, context, cc, bcc, attachments } = options;

      await this.mailerService.sendMail({
        to,
        subject,
        template, // Path to the template (without .hbs extension)
        context, // Data for the Handlebars template
        cc,
        bcc,
        attachments,
      });

      this.logger.log(`Email sent successfully to ${Array.isArray(to) ? to.join(", ") : to}`);
      return {
        success: true,
        message: `Email sent successfully to ${Array.isArray(to) ? to.join(", ") : to}`,
      };
    } catch (error) {
      const recipient = Array.isArray(options.to) ? options.to.join(", ") : options.to;
      this.logger.error(`Failed to send email to ${recipient}:`, error);
      return {
        success: false,
        message: `Failed to send email: ${error.message}`,
      };
    }
  }

  /**
   * Send a welcome email to a new user
   * @param to Recipient email address
   * @param name Recipient name
   * @param confirmUrl URL for account confirmation
   * @returns Promise resolving to success message or rejecting with error
   */
  async sendWelcomeEmail(
    to: string,
    name: string,
    confirmUrl: string
  ): Promise<{ success: boolean; message: string }> {
    return this.sendMail({
      to,
      subject: "Welcome to Our Platform!",
      template: "./welcome",
      context: {
        name,
        email: to,
        confirmUrl,
      },
    });
  }

  /**
   * Send a password reset email
   * @param to Recipient email address
   * @param name Recipient name
   * @param resetUrl URL for password reset
   * @returns Promise resolving to success message or rejecting with error
   */
  async sendPasswordReset(
    to: string,
    name: string,
    resetLink: string
  ): Promise<{ success: boolean; message: string }> {
    return this.sendMail({
      to,
      subject: "Password Reset Request",
      template: "./password-reset",
      context: {
        name,
        resetLink,
      },
    });
  }

  async sendEmailVerification(
    to: string,
    name: string,
    verificationLink: string
  ): Promise<{ success: boolean; message: string }> {
    return this.sendMail({
      to,
      subject: "Verify Your Email Address",
      template: "./email-verification",
      context: {
        name,
        verificationLink,
      },
    });
  }

  async sendCreatePassword(
    to: string,
    name: string,
    createPasswordLink: string
  ): Promise<{ success: boolean; message: string }> {
    return this.sendMail({
      to,
      subject: "Welcome to Kangalos! Create Your Password",
      template: "./create-password",
      context: {
        name,
        createPasswordLink,
      },
    });
  }

  /**
   * Send a critical error email
   * @param to Recipient email address
   * @param errorMessage The error message to include
   * @param appName Application name
   * @returns Promise resolving to success message or rejecting with error
   */
  async sendCriticalErrorEmail(
    to: string,
    errorMessage: string,
    appName: string
  ): Promise<{ success: boolean; message: string }> {
    return this.sendMail({
      to,
      subject: `🚨 Critical Error in ${appName} Application`,
      template: "./critical-error",
      context: {
        errorMessage,
        timestamp: new Date().toISOString(),
        appName,
      },
    });
  }
}
