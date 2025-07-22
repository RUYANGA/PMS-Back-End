import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Min } from "class-validator";

export class QueryUserDto {
  @ApiPropertyOptional({
    description: "Search term (matches name, email, phone, username, or user type)",
    example: "john",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "Page number",
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Page size",
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: "Field to sort by",
    example: "firstName",
    enum: ["firstName", "lastName", "email", "username", "userType", "id"],
    default: "firstName",
  })
  @IsOptional()
  @IsString()
  @IsIn(["firstName", "lastName", "email", "username", "userType", "id"])
  sortBy?: string = "firstName";

  @ApiPropertyOptional({
    description: "Sort order",
    example: "asc",
    enum: ["asc", "desc"],
    default: "asc",
  })
  @IsOptional()
  @IsString()
  @IsIn(["asc", "desc"])
  sortOrder?: string = "asc";
}
