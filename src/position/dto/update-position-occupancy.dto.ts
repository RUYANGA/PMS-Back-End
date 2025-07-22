import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsOptional } from "class-validator";

export class UpdatePositionOccupancyDto {
  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false, description: "New start date" })
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false, description: "New end date" })
  endDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false, description: "Original start date for identification" })
  originalStartDate?: string;
}
