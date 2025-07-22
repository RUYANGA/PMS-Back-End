import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class QueryStartupDto {
  @ApiPropertyOptional({ description: "Page number", example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: "Items per page", example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: "Search term", example: "tech" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "Sort by field",
    example: "name",
    enum: ["name", "year", "registered", "createdAt"],
    default: "name",
  })
  @IsOptional()
  @IsString()
  sortBy?: string = "name";

  @ApiPropertyOptional({
    description: "Sort direction",
    example: "asc",
    enum: ["asc", "desc"],
    default: "asc",
  })
  @IsOptional()
  @IsString()
  sortOrder?: string = "asc";

  @ApiPropertyOptional({
    description: "Filter by project ID",
    example: "00000000-0000-0000-0000-000000000000",
  })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional({ description: "Filter by registration status", example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  registered?: boolean;

  @ApiPropertyOptional({ description: "Filter by year", example: 2024 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;
}
