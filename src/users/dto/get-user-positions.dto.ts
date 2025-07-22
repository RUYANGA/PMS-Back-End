import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class GetUserPositionsDto {
  @ApiPropertyOptional({
    description: "Filter by user ID",
    example: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    required: false,
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({
    description: "Filter by position ID",
    example: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    required: false,
  })
  @IsOptional()
  @IsUUID()
  positionId?: string;

  @ApiPropertyOptional({
    description: "Filter for current assignments (end date is null or in the future)",
    example: true,
    default: false,
    required: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  currentOnly?: boolean = false;

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
    description: "Search term for filtering by position title or organisation unit name",
    example: "engineer",
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "Field to sort by",
    example: "startDate",
    enum: ["startDate", "endDate"],
    default: "startDate",
  })
  @IsOptional()
  @IsString()
  @IsIn(["startDate", "endDate"])
  sortBy?: string = "startDate";

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
