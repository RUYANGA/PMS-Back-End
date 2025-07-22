import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class ForgotPasswordDto {
  @ApiProperty({
    example: "john@example.com",
    description: "User email address to send password reset link",
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
