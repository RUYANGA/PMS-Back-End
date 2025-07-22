import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";

export class RegisterDto {
  @ApiProperty({ example: "John", description: "First name of the user" })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: "Doe", description: "Last name of the user" })
  @IsString()
  lastName: string;

  @ApiProperty({ example: "johndoe", description: "Unique username for the user" })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ example: "john.doe@example.com", description: "Unique email address of the user" })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: "+250780000000", description: "Unique phone number of the user" })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: "SecurePassword123", description: "Password for the user account" })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    example: "STUDENT",
    enum: ["STUDENT", "STAFF", "INDIVIDUAL", "ORGANISATION"],
    description: "Type of user",
  })
  @IsNotEmpty()
  @IsEnum(["STUDENT", "STAFF", "INDIVIDUAL", "ORGANISATION"], {
    message: "Invalid user type",
  })
  userType: "ORGANISATION" | "STUDENT" | "STAFF" | "INDIVIDUAL";
}
