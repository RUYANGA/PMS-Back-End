import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";

import { QueryUserDto } from "../../users/dto/query-user.dto";

export class GetOrgUnitUsersQueryDto extends QueryUserDto {
  @ApiPropertyOptional({
    description: "Filter for current users (end date is null or in the future)",
    example: true,
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  currentOnly?: boolean = false;
}
