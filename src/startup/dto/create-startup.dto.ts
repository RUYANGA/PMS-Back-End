import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class CreateStartupDto {
  @ApiProperty({ description: "Name of the startup", example: "Tech Innovators" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: "Description of the startup",
    example: "A promising tech startup",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "Associated project ID",
    example: "00000000-0000-0000-0000-000000000000",
  })
  @IsUUID()
  projectId: string;

  @ApiProperty({ description: "Year of the startup", example: 2024 })
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  year: number;

  @ApiPropertyOptional({ description: "Whether the startup is registered", example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  registered?: boolean = false;
}
