import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CreateCategoryDto {
  @ApiProperty({ description: "The name of the category", example: "Science" })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: "The description of the category",
    example: "Categories related to scientific research",
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: "The ID of the parent category (UUID)",
    example: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  })
  @IsString()
  @IsOptional()
  parentId?: string;
}
