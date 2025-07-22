import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsOptional, IsUUID } from "class-validator";

export class CreateUserPositionDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({ description: "ID of the user to assign" })
  userId: string;

  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({ description: "ID of the position to assign" })
  positionId: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false, description: "Start date of the assignment" })
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false, description: "End date of the assignment" })
  endDate?: string;
}
