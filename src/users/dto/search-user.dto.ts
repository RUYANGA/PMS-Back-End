import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString, IsUUID } from "class-validator";

import { QueryUserDto } from "./query-user.dto";

export class SearchUserDto extends QueryUserDto {
  @ApiPropertyOptional({
    description: "Filter by user type",
    enum: ["STUDENT", "STAFF", "INDIVIDUAL", "ORGANISATION"],
    example: "STAFF",
  })
  @IsOptional()
  @IsString()
  @IsIn(["STUDENT", "STAFF", "INDIVIDUAL", "ORGANISATION"])
  userType?: "STUDENT" | "STAFF" | "INDIVIDUAL" | "ORGANISATION";

  @ApiPropertyOptional({
    description: "Filter users by organisation unit id",
    example: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  })
  @IsOptional()
  @IsUUID()
  organisationUnitId?: string;
}
