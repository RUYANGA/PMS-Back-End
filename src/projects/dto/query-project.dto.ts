import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsIn, IsInt, IsOptional, IsString, IsUUID, Min } from "class-validator";

import { ProjectStatus } from "./create-project.dto";

export class QueryProject {
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
    description: "Search term for filtering project by title ,titleNorm, year ,etc ",
    example: "technology",
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "Field to sort by",
    example: "title",
    enum: ["title", "titleNorm", "id", "organisationUnitId", "year", "submittedAt"],
    default: "title",
  })
  @IsOptional()
  @IsString()
  @IsIn(["title", "id", "organisationUnitId", "titleNorm", "year", "submittedAt"])
  sortBy?: string = "title";

  @ApiPropertyOptional({
    description: "Sort order",
    example: "asc",
    enum: ["asc", "desc"],
    default: "asc",
  })
  @IsOptional()
  @IsString()
  @IsIn(["asc", "desc"])
  sortOrder?: string = "asc";

  @ApiPropertyOptional({
    description: "Filter by organisation unit ID",
    example: "00000000-0000-0000-0000-000000000000",
    required: false,
  })
  @IsOptional()
  @IsUUID()
  organisationUnitId?: string;

  @ApiPropertyOptional({ description: "Filter by project status", enum: ProjectStatus })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiPropertyOptional({ description: "Filter by project year", example: 2024 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @ApiPropertyOptional({ description: "Filter by project type", example: "RESEARCH" })
  @IsOptional()
  @IsString()
  projectType?: string;

  @ApiPropertyOptional({
    description: "Filter by author (user) ID",
    example: "00000000-0000-0000-0000-000000000000",
  })
  @IsOptional()
  @IsUUID()
  authorId?: string;
}
