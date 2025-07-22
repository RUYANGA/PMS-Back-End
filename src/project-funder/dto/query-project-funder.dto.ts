import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class QueryProjectFunderDto {
  @ApiPropertyOptional({ example: 1, default: 1, description: "Page number" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10, description: "Items per page" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: "Filter by project ID" })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional({ description: "Filter by funder ID" })
  @IsOptional()
  @IsUUID()
  funderId?: string;

  @ApiPropertyOptional({
    description: "Sort field",
    enum: ["createdAt", "amount"],
    default: "createdAt",
  })
  @IsOptional()
  @IsString()
  sortBy?: string = "createdAt";

  @ApiPropertyOptional({ description: "Sort order", enum: ["asc", "desc"], default: "desc" })
  @IsOptional()
  @IsString()
  sortOrder?: string = "desc";
}
