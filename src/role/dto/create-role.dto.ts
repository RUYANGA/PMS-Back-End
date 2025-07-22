import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateRoleDto {
  @ApiProperty({ description: "Name of the role", example: "Administrator" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    required: false,
    description: "Description of the role",
    example: "Manages system settings and users",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    required: false,
    description: "ID of the organisation unit this role belongs to",
    example: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  })
  @IsOptional()
  @IsUUID()
  organisationUnitId?: string;
}
