import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUUID } from "class-validator";

export class CreateProjectSdgDto {
  @ApiProperty({ example: "e6b4c14a-7f92-4f61-9c5e-1234567890ab", description: "ID of the SDG" })
  @IsUUID()
  @IsNotEmpty()
  sdgId: string;
}
