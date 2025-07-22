import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import { UuidValidationPipe } from "../shared/pipes/uuid-validation.pipe";
import { CreateProjectReportWithoutProjectIdDto } from "./dto/create-project-report-without-project-id.dto";
import { QueryProjectReportDto } from "./dto/query-project-report.dto";
import { ProjectReportService } from "./project-report.service";

@ApiTags("Projects Reports")
@Controller("projects")
export class ProjectsReportsController {
  constructor(private readonly projectReportService: ProjectReportService) {}

  @Get(":id/reports")
  @ApiOperation({ summary: "Get reports for a project" })
  @ApiParam({ name: "id", description: "Project ID" })
  @ApiResponse({ status: 200, description: "List of project reports returned successfully." })
  async list(@Param("id", UuidValidationPipe) id: string, @Query() query: QueryProjectReportDto) {
    return this.projectReportService.findByProject(id, query);
  }

  @Post(":id/reports")
  @ApiOperation({ summary: "Create a report for a project" })
  @ApiParam({ name: "id", description: "Project ID" })
  @ApiBody({ type: CreateProjectReportWithoutProjectIdDto })
  @ApiResponse({ status: 201, description: "Project report created successfully." })
  async create(
    @Param("id", UuidValidationPipe) id: string,
    @Body() dto: CreateProjectReportWithoutProjectIdDto
  ) {
    return this.projectReportService.create({ ...dto, projectId: id });
  }

  @Get(":id/reports/latest")
  @ApiOperation({ summary: "Get latest report for a project" })
  @ApiParam({ name: "id", description: "Project ID" })
  @ApiResponse({ status: 200, description: "Latest project report returned." })
  async latest(@Param("id", UuidValidationPipe) id: string) {
    return this.projectReportService.findLatest(id);
  }

  @Get(":id/reports/summary")
  @ApiOperation({ summary: "Get summary of project reports" })
  @ApiParam({ name: "id", description: "Project ID" })
  @ApiResponse({ status: 200, description: "Project reports summary returned." })
  async summary(@Param("id", UuidValidationPipe) id: string) {
    return this.projectReportService.summary(id);
  }
}
