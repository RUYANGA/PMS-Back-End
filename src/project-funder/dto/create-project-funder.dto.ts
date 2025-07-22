import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsUUID, Min } from "class-validator";

export class CreateProjectFunderDto {
  @ApiProperty({ description: "Project ID", example: "c1b2d3e4-f5a6-7890-1234-567890abcdef" })
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({ description: "Funder ID", example: "a1b2c3d4-e5f6-7890-1234-567890abcdef" })
  @IsUUID()
  @IsNotEmpty()
  funderId: string;

  @ApiPropertyOptional({ description: "Funding amount", example: 50000.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: "Amount must be a valid number with up to 2 decimal places" }
  )
  @Min(0)
  amount?: number;
}
