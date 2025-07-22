import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUUID } from "class-validator";

export class CreateUserRoleDto {
  @ApiProperty({ description: "ID of the user" })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: "ID of the role" })
  @IsUUID()
  @IsNotEmpty()
  roleId: string;
}
