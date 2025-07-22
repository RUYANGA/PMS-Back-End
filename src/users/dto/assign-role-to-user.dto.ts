import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUUID } from "class-validator";

export class AssignRoleToUserDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({ description: "ID of the role to assign to the user" })
  roleId: string;
}
