import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class VerifyEmailDto {
  @ApiProperty({
    example: "your_verification_token",
    description: "Token received in the email verification link",
  })
  @IsNotEmpty()
  @IsString()
  token: string;
}
