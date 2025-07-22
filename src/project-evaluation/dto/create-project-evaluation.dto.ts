import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";

export enum EvaluationStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
}

export class CreateProjectEvaluationDto {
  @ApiProperty({ description: "Project ID", example: "123e4567-e89b-12d3-a456-426614174000" })
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({ description: "Evaluator ID", example: "123e4567-e89b-12d3-a456-426614174000" })
  @IsUUID()
  @IsNotEmpty()
  evaluatorId: string;

  @ApiProperty({ description: "Score from 0 to 100", example: 85 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  score: number;

  @ApiPropertyOptional({ description: "Evaluator comments", example: "Great work" })
  @IsOptional()
  @IsString()
  comments?: string;

  @ApiPropertyOptional({ enum: EvaluationStatus, example: EvaluationStatus.PENDING })
  @IsOptional()
  @IsEnum(EvaluationStatus)
  status?: EvaluationStatus;
}
