import { PartialType } from "@nestjs/swagger";

import { CreateProjectFunderDto } from "./create-project-funder.dto";

export class UpdateProjectFunderDto extends PartialType(CreateProjectFunderDto) {}
