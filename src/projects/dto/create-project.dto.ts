import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from "class-validator";

export enum ProjectStatus {
  PENDING = "PENDING",
  UNDER_REVIEW = "UNDER_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  FUNDED = "FUNDED",
  COMPLETED = "COMPLETED",
  ARCHIVED = "ARCHIVED",
}

export enum IpType {
  PATENT = "PATENT",
  UTILITY_MODEL = "UTILITY_MODEL",
  COPYRIGHT = "COPYRIGHT",
  TRADEMARK = "TRADEMARK",
  NONE = "NONE",
}

export class createProjectDto {
  @ApiProperty({ example: "Smart Irrigation System" })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: "smart_irrigation_system" })
  @IsNotEmpty()
  @IsString()
  titleNorm: string;

  @ApiProperty({ example: "ENGINEERING" })
  @IsNotEmpty()
  @IsString()
  projectType: string;

  @ApiProperty({ example: 2025 })
  @IsNotEmpty()
  @IsInt()
  year: number;

  @ApiProperty({
    description: "The ID of the organisation unit this project belongs to",
    example: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    required: true,
  })
  @IsUUID()
  organisationUnitId: string;

  @ApiPropertyOptional({ example: "An automated system to optimize water usage." })
  @IsOptional()
  @IsString()
  abstract?: string;

  @ApiPropertyOptional({ example: "Agritech" })
  @IsOptional()
  @IsString()
  innovationField?: string;

  @ApiPropertyOptional({ enum: IpType, example: IpType.PATENT })
  @IsOptional()
  @IsEnum(IpType)
  expectedIp?: IpType;

  @ApiPropertyOptional({
    example: 76.5,
    description: "Percentage of progress completed (0.00 to 100.00)",
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: "Must have at most 2 decimal places" })
  @Min(0)
  @Max(100)
  progressPercent?: number;

  @ApiPropertyOptional({ enum: ProjectStatus, example: ProjectStatus.UNDER_REVIEW })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiPropertyOptional({ example: "2025-07-12T12:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  submittedAt?: string;
}
