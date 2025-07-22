import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import { UuidValidationPipe } from "../shared/pipes/uuid-validation.pipe";
import { QueryProjectReportDto } from "./dto/query-project-report.dto";
import { ProjectReportService } from "./project-report.service";

@ApiTags("Project Reports Queries")
@Controller("reports")
export class ReportsQueriesController {
  constructor(private readonly projectReportService: ProjectReportService) {}

  @Get("by-submitter/:userId")
  @ApiOperation({ summary: "Get reports submitted by a user" })
  @ApiParam({ name: "userId", description: "User ID" })
  @ApiResponse({ status: 200, description: "List of project reports returned." })
  async bySubmitter(
    @Param("userId", UuidValidationPipe) userId: string,
    @Query() query: QueryProjectReportDto
  ) {
    return this.projectReportService.findBySubmitter(userId, query);
  }

  @Get("by-period/:period")
  @ApiOperation({ summary: "Get reports for a reporting period" })
  @ApiParam({ name: "period", description: "Reporting period" })
  @ApiResponse({ status: 200, description: "List of project reports returned." })
  async byPeriod(@Param("period") period: string, @Query() query: QueryProjectReportDto) {
    return this.projectReportService.findByPeriod(period, query);
  }

  @Get("pending")
  @ApiOperation({ summary: "Get pending project reports" })
  @ApiResponse({ status: 200, description: "List of project reports returned." })
  async pending(@Query() query: QueryProjectReportDto) {
    return this.projectReportService.findPending(query);
  }
}
