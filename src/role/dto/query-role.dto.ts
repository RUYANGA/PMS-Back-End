import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";

export class QueryRoleDto {
  @ApiPropertyOptional({ required: false, description: "Filter by organisation unit" })
  @IsOptional()
  @IsUUID()
  organisationUnitId?: string;

  @ApiPropertyOptional({ required: false, description: "Search by role name" })
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @ApiPropertyOptional({ required: false, default: 1 })
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @ApiPropertyOptional({ required: false, default: 10 })
  limit?: number = 10;
}
