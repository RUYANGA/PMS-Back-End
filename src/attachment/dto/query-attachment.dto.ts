import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional, IsPositive, IsString, IsUUID } from "class-validator";

export class QueryAttachmentDto {
  @ApiProperty({ required: false, description: "Page number", example: 1 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  page?: number;

  @ApiProperty({ required: false, description: "Items per page", example: 10 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  limit?: number;

  @ApiProperty({ required: false, description: "Search term for filename", example: "report" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    required: false,
    description: "Filter by project ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiProperty({
    required: false,
    description: "Filter by uploader ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsOptional()
  @IsUUID()
  uploaderId?: string;
}
