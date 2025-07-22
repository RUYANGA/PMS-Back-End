import { PartialType } from "@nestjs/swagger";

import { createProjectDto } from "./create-project.dto";

export class UpdateProjectDto extends PartialType(createProjectDto) {}
