import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateFunderDto {
  @ApiProperty({
    description: "The name of the funder (2-100 characters). Must be unique in the system.",
    example: "National Research Foundation",
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: "Name must be at least 2 characters long" })
  @MaxLength(100, { message: "Name cannot be longer than 100 characters" })
  @Matches(/^[a-zA-Z0-9\s\-.,&]+$/, {
    message:
      "Name can only contain letters, numbers, spaces, hyphens, commas, periods and ampersands",
  })
  name: string;

  @ApiProperty({
    description:
      "The type of the funder (e.g., 'Government Agency', 'Private Foundation', 'Corporate Sponsor')",
    example: "Government Agency",
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: "Funder type must be at least 2 characters long" })
  @MaxLength(50, { message: "Funder type cannot be longer than 50 characters" })
  funderType: string;

  @ApiProperty({
    description:
      "The official contact email for the funder. Must be a valid email format if provided.",
    example: "contact@nrf.gov",
    required: false,
    pattern: "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$",
  })
  @IsOptional()
  @IsEmail({}, { message: "Please provide a valid email address" })
  @MaxLength(255, { message: "Email cannot be longer than 255 characters" })
  contactEmail?: string;

  @ApiProperty({
    description:
      "The official contact phone number for the funder. Should include country code if international.",
    example: "+1-555-123-4567",
    required: false,
    pattern: "^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\\s\\./0-9]*$",
  })
  @IsOptional()
  @IsString()
  @IsPhoneNumber(null, { message: "Please provide a valid phone number" })
  @MaxLength(20, { message: "Phone number cannot be longer than 20 characters" })
  contactPhone?: string;
}
