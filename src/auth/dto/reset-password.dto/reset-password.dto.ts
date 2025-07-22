import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class ResetPasswordDto {
  @ApiProperty({
    example: "your_reset_token",
    description: "Token received in the reset password email",
  })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({
    example: "NewSecurePassword123",
    description: "New password for the user account",
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  newPassword: string;
}
