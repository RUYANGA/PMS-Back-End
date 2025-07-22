import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreatePositionDto {
  @ApiProperty({
    description: "The title of the position",
    example: "Software Engineer",
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: "The description of the position (optional)",
    example: "Develops and maintains software applications.",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "The ID of the organisation unit this position belongs to",
    example: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  })
  @IsUUID()
  @IsNotEmpty()
  organisationUnitId: string;
}
