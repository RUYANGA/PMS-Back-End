import { PartialType } from "@nestjs/swagger";

import { CreateOrganisationUnitDto } from "./create-organisation-unit.dto";

export class UpdateOrganisationUnitDto extends PartialType(CreateOrganisationUnitDto) {}
