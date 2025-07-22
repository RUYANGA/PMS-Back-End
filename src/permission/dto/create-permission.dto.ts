import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreatePermissionDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: "Permission code (unique identifier)", example: "user.create" })
  code: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    description: "Permission description",
    example: "Allows creation of new users",
  })
  description?: string;
}
