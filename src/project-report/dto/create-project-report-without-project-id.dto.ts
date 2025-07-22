import { OmitType } from "@nestjs/swagger";

import { CreateProjectReportDto } from "./create-project-report.dto";

export class CreateProjectReportWithoutProjectIdDto extends OmitType(CreateProjectReportDto, [
  "projectId",
] as const) {}
