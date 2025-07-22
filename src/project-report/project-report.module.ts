import { Module } from "@nestjs/common";

import { ProjectReportController } from "./project-report.controller";
import { ProjectReportService } from "./project-report.service";
import { ProjectsReportsController } from "./projects-reports.controller";
import { ReportsQueriesController } from "./reports-queries.controller";

@Module({
  controllers: [ProjectReportController, ProjectsReportsController, ReportsQueriesController],
  providers: [ProjectReportService],
})
export class ProjectReportModule {}
