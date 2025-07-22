import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from "class-validator";

export enum StakeholderRole {
  OWNER = "OWNER",
  PARTNER = "PARTNER",
  SPONSOR = "SPONSOR",
  REGULATOR = "REGULATOR",
  BENEFICIARY = "BENEFICIARY",
}

export class CreateProjectStakeholderDto {
  @ApiProperty({
    description: "ID of the stakeholder",
    example: "f291d0b2-1b75-4eb2-9474-3bff3f1a6a1d",
  })
  @IsNotEmpty()
  @IsUUID()
  stakeholderId: string;

  @ApiPropertyOptional({
    enum: StakeholderRole,
    example: StakeholderRole.PARTNER,
    description: "Role of the stakeholder in the project",
  })
  @IsOptional()
  @IsEnum(StakeholderRole)
  role?: StakeholderRole;
}
