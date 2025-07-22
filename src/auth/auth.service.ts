import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

import { InfrastructureService } from "../infrastructure/infrastructure.service";
import { LoggerService } from "../logger/logger.service";
import { MailService } from "../mail/mail.service";
import { PrismaService } from "../prisma/prisma.service";
import { TokenEncryptionUtil } from "../shared/utils/token-encryption.util";
import { UsersService } from "../users/users.service";
import { ForgotPasswordDto } from "./dto/forgot-password.dto/forgot-password.dto";
import { LoginDto } from "./dto/login.dto/login.dto";
import { RegisterDto } from "./dto/register.dto/register.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto/reset-password.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto/verify-email.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly infrastructureService: InfrastructureService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly tokenEncryptionUtil: TokenEncryptionUtil
  ) {}

  async register(registerDto: RegisterDto) {
    this.logger.log(`Attempting to register user: ${registerDto.email}`, "AuthService");
    await this.infrastructureService.checkDuplicate("user", [
      { property: "email", value: registerDto.email },
      { property: "username", value: registerDto.username },
      { property: "phone", value: registerDto.phone },
    ]);

    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        ...registerDto,
        password: hashedPassword,
      },
    });

    const verificationToken = this.jwtService.sign({
      email: registerDto.email,
      type: "email_verification",
    });
    const encryptedToken = this.tokenEncryptionUtil.encrypt(verificationToken);
    const verificationLink = `${this.configService.get<string>(
      "FRONTEND_URL"
    )}/verify-email?token=${encryptedToken}`;

    await this.mailService.sendEmailVerification(user.email, user.firstName, verificationLink);

    this.logger.log(`User registered successfully: ${user.email}`, "AuthService");
    return {
      status: true,
      message: "User registered successfully. Please verify your email.",
      data: { user: { id: user.id, email: user.email } },
      meta: {},
    };
  }

  async login(loginDto: LoginDto) {
    this.logger.log(`Attempting to log in user: ${loginDto.email}`, "AuthService");
    const user = await this.prisma.user.findUnique({ where: { email: loginDto.email } });

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      this.logger.warn(
        `Login failed for email: ${loginDto.email} - Invalid credentials`,
        "AuthService"
      );
      throw new UnauthorizedException("Invalid credentials");
    }

    if (!user.isVerified) {
      this.logger.warn(
        `Login failed for email: ${loginDto.email} - Email not verified`,
        "AuthService"
      );
      throw new UnauthorizedException("Please verify your email address");
    }

    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    this.logger.log(`User logged in successfully: ${user.email}`, "AuthService");
    return {
      status: true,
      message: "Login successful",
      data: { accessToken },
      meta: {},
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    this.logger.log(
      `Attempting to send password reset for: ${forgotPasswordDto.email}`,
      "AuthService"
    );
    const user = await this.prisma.user.findUnique({ where: { email: forgotPasswordDto.email } });

    if (user) {
      const resetToken = this.jwtService.sign(
        { email: user.email, type: "password_reset" },
        { expiresIn: "1h" }
      );
      const encryptedToken = this.tokenEncryptionUtil.encrypt(resetToken);
      const resetLink = `${this.configService.get<string>(
        "FRONTEND_URL"
      )}/reset-password?token=${encryptedToken}`;

      await this.mailService.sendPasswordReset(user.email, user.firstName, resetLink);
    } else {
      this.logger.warn(
        `Password reset requested for non-existent user: ${forgotPasswordDto.email}`,
        "AuthService"
      );
    }

    this.logger.log(`Password reset email sent to: ${forgotPasswordDto.email}`, "AuthService");
    return {
      status: true,
      message: "If an account with this email exists, a password reset link has been sent.",
      data: {},
      meta: {},
    };
  }

  async sendCreatePasswordEmail(email: string) {
    this.logger.log(`Attempting to send create password email for: ${email}`, "AuthService");
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (user) {
      const resetToken = this.jwtService.sign(
        { email: user.email, type: "password_reset" },
        { expiresIn: "7d" } // Longer expiry for new users
      );
      const encryptedToken = this.tokenEncryptionUtil.encrypt(resetToken);
      const resetLink = `${this.configService.get<string>(
        "FRONTEND_URL"
      )}/reset-password?token=${encryptedToken}`;

      await this.mailService.sendCreatePassword(user.email, user.firstName, resetLink);
    } else {
      this.logger.warn(
        `Create password email requested for non-existent user: ${email}`,
        "AuthService"
      );
    }

    this.logger.log(`Create password email sent to: ${email}`, "AuthService");
    return {
      status: true,
      message: "If an account with this email exists, a create password link has been sent.",
      data: {},
      meta: {},
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    this.logger.log("Attempting to reset password", "AuthService");
    try {
      const decryptedToken = this.tokenEncryptionUtil.decrypt(resetPasswordDto.token);
      const decodedToken = this.jwtService.verify(decryptedToken);

      if (decodedToken.type !== "password_reset") {
        throw new BadRequestException("Invalid token type");
      }

      const user = await this.prisma.user.findUnique({
        where: {
          email: decodedToken.email,
        },
      });

      if (!user) {
        this.logger.warn("Password reset failed - User not found", "AuthService");
        throw new BadRequestException("Invalid token or user not found");
      }

      const isSamePassword = await bcrypt.compare(resetPasswordDto.newPassword, user.password);
      if (isSamePassword) {
        throw new BadRequestException("New password cannot be the same as the old password");
      }

      const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 12);

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
        },
      });

      this.logger.log(`Password reset successful for user: ${user.email}`, "AuthService");
      return {
        status: true,
        message: "Password has been reset successfully",
        data: {},
        meta: {},
      };
    } catch (error) {
      this.logger.error(`Password reset error: ${error.message}`, "AuthService", error.stack);
      if (error.message === "Decryption failed" || error.name === "JsonWebTokenError") {
        throw new BadRequestException("Invalid token");
      }
      if (error.name === "TokenExpiredError") {
        throw new BadRequestException("Token has expired");
      }
      throw new InternalServerErrorException("Failed to reset password");
    }
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    this.logger.log("Attempting to verify email", "AuthService");
    try {
      const decryptedToken = this.tokenEncryptionUtil.decrypt(verifyEmailDto.token);
      const decodedToken = this.jwtService.verify(decryptedToken);

      if (decodedToken.type !== "email_verification") {
        throw new BadRequestException("Invalid token type");
      }

      const user = await this.prisma.user.findUnique({
        where: {
          email: decodedToken.email,
        },
      });

      if (!user) {
        this.logger.warn("Email verification failed - User not found", "AuthService");
        throw new BadRequestException("Invalid verification token or user not found");
      }

      if (user.isVerified) {
        this.logger.warn(`Email already verified for user: ${user.email}`, "AuthService");
        return {
          status: true,
          message: "Email already verified",
          data: {},
          meta: {},
        };
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          isVerified: true,
        },
      });

      this.logger.log(`Email verified successfully for user: ${user.email}`, "AuthService");
      return {
        status: true,
        message: "Email verified successfully",
        data: {},
        meta: {},
      };
    } catch (error) {
      this.logger.error(`Email verification error: ${error.message}`, "AuthService", error.stack);
      if (error.message === "Decryption failed" || error.name === "JsonWebTokenError") {
        throw new BadRequestException("Invalid token");
      }
      if (error.name === "TokenExpiredError") {
        throw new BadRequestException("Verification token has expired");
      }
      throw new InternalServerErrorException("Failed to verify email");
    }
  }
}
