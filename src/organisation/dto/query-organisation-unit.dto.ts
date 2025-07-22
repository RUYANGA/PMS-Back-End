import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsEnum, IsIn, IsInt, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class QueryOrganisationUnitDto {
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
    description: "Search term for filtering organisation units by name or code",
    example: "science",
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "Field to sort by",
    example: "name",
    enum: ["name", "code", "id", "parentId"],
    default: "name",
  })
  @IsOptional()
  @IsString()
  @IsIn(["name", "code", "id", "parentId"])
  sortBy?: string = "name";

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
    description: "Filter by parent ID",
    example: "00000000-0000-0000-0000-000000000000",
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({
    description: "Include positions in the response",
    example: true,
    default: false,
    required: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includePositions?: boolean = false;
}
