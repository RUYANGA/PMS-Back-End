import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from "class-validator";

import { EvaluationStatus } from "./create-project-evaluation.dto";

export class QueryProjectEvaluationDto {
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

  @ApiPropertyOptional({
    description: "Filter by project ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional({
    description: "Filter by evaluator ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsOptional()
  @IsUUID()
  evaluatorId?: string;

  @ApiPropertyOptional({ enum: EvaluationStatus, description: "Filter by status" })
  @IsOptional()
  @IsEnum(EvaluationStatus)
  status?: EvaluationStatus;
}
