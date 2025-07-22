import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateProjectReportDto {
  @ApiProperty({
    description: "The ID of the project this report belongs to",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({
    description: "Title of the project report (2-100 characters)",
    example: "Q1 2023 Progress Report",
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: "Title must be at least 2 characters long" })
  @MaxLength(100, { message: "Title cannot be longer than 100 characters" })
  title: string;

  @ApiProperty({
    description: "The reporting period this report covers (e.g., 'Q1 2023')",
    example: "Q1 2023",
    required: false,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: "Reporting period cannot be longer than 50 characters" })
  reportingPeriod?: string;

  @ApiProperty({
    description: "The content/details of the project report",
    example: "Project is progressing well with all milestones met...",
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    description: "Amount of funds used during this reporting period",
    example: 12500.5,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: "Fund usage must be a valid number with up to 2 decimal places" }
  )
  fundUsage?: number;

  @ApiProperty({
    description: "ID of the user submitting this report",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  @IsNotEmpty()
  submittedById: string;
}
