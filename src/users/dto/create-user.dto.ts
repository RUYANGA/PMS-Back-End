import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";

export class CreateUserDto {
  @ApiProperty({ example: "John Doe" })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: "MUKURARINDA" })
  @IsString()
  lastName: string;

  @ApiProperty({ example: "Kaba" })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ example: "john@example.com" })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: "+250780905910" })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: "STUDENT" })
  @IsNotEmpty()
  @IsEnum(["STUDENT", "STAFF", "INDIVIDUAL", "ORGANISATION"], {
    message: "Invalid user type",
  })
  userType: "ORGANISATION" | "STUDENT" | "STAFF" | "INDIVIDUAL";
}
