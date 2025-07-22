import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { AuthService } from "./auth.service";
import { ForgotPasswordDto } from "./dto/forgot-password.dto/forgot-password.dto";
import { LoginDto } from "./dto/login.dto/login.dto";
import { RegisterDto } from "./dto/register.dto/register.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto/reset-password.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto/verify-email.dto";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({
    status: 201,
    description: "User registered successfully. Please verify your email.",
  })
  @ApiResponse({ status: 400, description: "Bad Request" })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post("login")
  @ApiOperation({ summary: "User login" })
  @ApiResponse({ status: 200, description: "Login successful" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post("forgot-password")
  @ApiOperation({ summary: "Request password reset" })
  @ApiResponse({ status: 200, description: "Password reset email sent" })
  @ApiResponse({ status: 404, description: "User not found" })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post("reset-password")
  @ApiOperation({ summary: "Reset password" })
  @ApiResponse({ status: 200, description: "Password has been reset successfully" })
  @ApiResponse({ status: 400, description: "Invalid or expired token" })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post("verify-email")
  @ApiOperation({ summary: "Verify email address" })
  @ApiResponse({ status: 200, description: "Email verified successfully" })
  @ApiResponse({ status: 400, description: "Invalid or expired verification token" })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }
}
