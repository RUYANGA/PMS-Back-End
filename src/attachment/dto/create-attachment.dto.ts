import { ApiProperty } from "@nestjs/swagger";
import {
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Min,
} from "class-validator";

export class CreateAttachmentDto {
  @ApiProperty({
    description: "ID of the project this attachment belongs to",
    example: "123e4567-e89b-12d3-a456-426614174000",
    required: false,
  })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiProperty({
    description: "ID of the user uploading the file",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  @IsNotEmpty()
  uploaderId: string;

  @ApiProperty({ description: "Original filename", example: "report.pdf" })
  @IsString()
  @IsNotEmpty()
  filename: string;

  @ApiProperty({
    description: "URL where the file is stored",
    example: "https://files.example.com/report.pdf",
  })
  @IsUrl()
  url: string;

  @ApiProperty({
    description: "MIME type of the file",
    example: "application/pdf",
    required: false,
  })
  @IsOptional()
  @IsString()
  fileType?: string;

  @ApiProperty({ description: "Size of the file in bytes", example: 12345, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  fileSize?: number;

  @ApiProperty({
    description: "Additional metadata",
    required: false,
    example: { description: "Project report" },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
