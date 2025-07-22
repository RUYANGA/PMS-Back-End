import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class GetUserRolesDto {
  @ApiPropertyOptional({ description: "Filter by user ID" })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: "Filter by role ID" })
  @IsOptional()
  @IsUUID()
  roleId?: string;

  @ApiPropertyOptional({ description: "Search term for user or role" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "Field to sort by",
    enum: ["createdAt", "updatedAt"],
    default: "createdAt",
  })
  @IsOptional()
  @IsString()
  @IsIn(["createdAt", "updatedAt"])
  sortBy?: string = "createdAt";

  @ApiPropertyOptional({ description: "Sort order", enum: ["asc", "desc"], default: "desc" })
  @IsOptional()
  @IsString()
  @IsIn(["asc", "desc"])
  sortOrder?: string = "desc";

  @ApiPropertyOptional({ description: "Page number", default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: "Items per page", default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
