import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export enum AuthorRole {
  LEAD = "LEAD",
  CO_AUTHOR = "CO_AUTHOR",
  SUPERVISOR = "SUPERVISOR",
}

export class CreateProjectAuthorDto {
  @ApiProperty({
    example: "f291d0b2-1b75-4eb2-9474-3bff3f1a6a1d",
    description: "Project ID (should match an existing Project)",
  })
  @IsNotEmpty()
  @IsUUID()
  projectId: string;

  @ApiProperty({
    example: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    description: "User ID (should match an existing User)",
  })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({
    enum: AuthorRole,
    example: AuthorRole.CO_AUTHOR,
    description: "Role of the user in the project",
  })
  @IsOptional()
  @IsEnum(AuthorRole)
  role?: AuthorRole;
}
