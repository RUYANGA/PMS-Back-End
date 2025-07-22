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

export class CreateStakeholderDto {
  @ApiProperty({
    description: "The name of the stakeholder (2-100 characters). Must be unique in the system.",
    example: "Head Officer of World vision Foundation",
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
      "The type of the stakeholder (e.g., 'Government Agency', 'Private Foundation', 'Corporate Sponsor')",
    example: "Government Agency",
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: "stakeholder type must be at least 2 characters long" })
  @MaxLength(50, { message: "stakeholder type cannot be longer than 50 characters" })
  stakeholderType: string;

  @ApiProperty({
    description:
      "The official contact email for the stakeholder. Must be a valid email format if provided.",
    example: "contact@kangalos.ur.rw",
    required: false,
    pattern: "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$",
  })
  @IsOptional()
  @IsEmail({}, { message: "Please provide a valid email address" })
  @MaxLength(255, { message: "Email cannot be longer than 255 characters" })
  contactEmail?: string;

  @ApiProperty({
    description:
      "The official contact phone number for the stakeholder. Should include country code if international.",
    example: "+250788884567",
    required: false,
    pattern: "^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\\s\\./0-9]*$",
  })
  @IsOptional()
  @IsString()
  @IsPhoneNumber(null, { message: "Please provide a valid phone number" })
  @MaxLength(20, { message: "Phone number cannot be longer than 20 characters" })
  contactPhone?: string;
}
