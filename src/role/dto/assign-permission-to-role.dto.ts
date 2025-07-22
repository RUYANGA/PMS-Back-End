import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUUID } from "class-validator";

export class AssignPermissionToRoleDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({ description: "ID of the permission to assign to the role" })
  permissionId: string;
}
