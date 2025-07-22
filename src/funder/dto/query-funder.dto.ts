import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Min } from "class-validator";

export class QueryFunderDto {
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
    description: "Search term for filtering funders by name or code",
    example: "science",
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "Field to sort by",
    example: "name",
    enum: ["name", "code", "id"],
    default: "name",
  })
  @IsOptional()
  @IsString()
  @IsIn(["name", "code", "id"])
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
}
