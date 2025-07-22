import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Min } from "class-validator";

export class QueryProjectReportDto {
  @ApiPropertyOptional({
    description: "Page number for pagination",
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Number of items per page for pagination",
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: "Search term for filtering reports by title or content",
    example: "progress",
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "Filter by project ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
    required: false,
  })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({
    description: "Filter by reporting period (exact match)",
    example: "Q1 2023",
    required: false,
  })
  @IsOptional()
  @IsString()
  reportingPeriod?: string;

  @ApiPropertyOptional({
    description: "Field to sort by",
    example: "submittedAt",
    enum: ["title", "submittedAt", "reportingPeriod"],
    default: "submittedAt",
  })
  @IsOptional()
  @IsString()
  @IsIn(["title", "submittedAt", "reportingPeriod"])
  sortBy?: string = "submittedAt";

  @ApiPropertyOptional({
    description: "Sort order",
    example: "desc",
    enum: ["asc", "desc"],
    default: "desc",
  })
  @IsOptional()
  @IsString()
  @IsIn(["asc", "desc"])
  sortOrder?: string = "desc";
}
