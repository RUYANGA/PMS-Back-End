import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsOptional, IsUUID } from "class-validator";

export class AssignUserToPositionDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({ description: "User ID to assign to position" })
  userId: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false, description: "Start date of assignment" })
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false, description: "End date of assignment" })
  endDate?: string;
}
