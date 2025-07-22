import { PartialType } from "@nestjs/swagger";

import { CreateProjectAuthorDto } from "./create-project-author.dto";

export class UpdateProjectAuthorDto extends PartialType(CreateProjectAuthorDto) {}
