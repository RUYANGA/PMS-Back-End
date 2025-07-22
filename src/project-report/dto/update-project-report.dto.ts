import { PartialType } from "@nestjs/swagger";

import { CreateProjectReportDto } from "./create-project-report.dto";

export class UpdateProjectReportDto extends PartialType(CreateProjectReportDto) {}
