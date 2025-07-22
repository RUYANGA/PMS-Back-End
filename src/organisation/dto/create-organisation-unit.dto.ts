import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateOrganisationUnitDto {
  @ApiProperty({
    description: "The name of the organisation unit",
    example: "Faculty of Science",
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "The unique code of the organisation unit (optional)",
    example: "FS",
    required: false,
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({
    description: "The ID of the parent organisation unit (optional)",
    example: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    required: false,
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
