import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsIn, IsInt, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class QueryPositionDto {
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
    description: "Search term for filtering positions by title or description",
    example: "engineer",
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "Field to sort by",
    example: "title",
    enum: ["title", "description", "id", "organisationUnitId"],
    default: "title",
  })
  @IsOptional()
  @IsString()
  @IsIn(["title", "description", "id", "organisationUnitId"])
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
  @IsString()
  @IsUUID()
  organisationUnitId?: string;
}
