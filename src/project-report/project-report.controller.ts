import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import { UuidValidationPipe } from "../shared/pipes/uuid-validation.pipe";
import { CreateProjectReportDto } from "./dto/create-project-report.dto";
import { QueryProjectReportDto } from "./dto/query-project-report.dto";
import { UpdateProjectReportDto } from "./dto/update-project-report.dto";
import { ProjectReportService } from "./project-report.service";

@ApiTags("Project Reports")
@Controller("project-reports")
export class ProjectReportController {
  constructor(private readonly projectReportService: ProjectReportService) {}

  @Post()
  @ApiOperation({ summary: "Create a new project report" })
  @ApiBody({ type: CreateProjectReportDto })
  @ApiResponse({
    status: 201,
    description: "The project report has been successfully created.",
  })
  @ApiResponse({ status: 400, description: "Invalid input data." })
  @ApiResponse({ status: 404, description: "Project or submitter not found." })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProjectReportDto: CreateProjectReportDto) {
    return this.projectReportService.create(createProjectReportDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all project reports with optional filtering" })
  @ApiResponse({
    status: 200,
    description: "List of project reports returned successfully.",
  })
  async findAll(@Query() query: QueryProjectReportDto) {
    return this.projectReportService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a project report by ID" })
  @ApiParam({ name: "id", description: "Project Report ID" })
  @ApiResponse({
    status: 200,
    description: "Project report details returned successfully.",
  })
  @ApiResponse({ status: 404, description: "Project report not found." })
  async findOne(@Param("id", UuidValidationPipe) id: string) {
    return this.projectReportService.findOne(id);
  }

  @Get("project/:projectId")
  @ApiOperation({ summary: "Get all reports for a specific project" })
  @ApiParam({ name: "projectId", description: "Project ID" })
  @ApiResponse({
    status: 200,
    description: "List of project reports returned successfully.",
  })
  @ApiResponse({ status: 404, description: "Project not found." })
  async findByProject(@Param("projectId", UuidValidationPipe) projectId: string) {
    return this.projectReportService.findByProject(projectId);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a project report by ID" })
  @ApiParam({ name: "id", description: "Project Report ID" })
  @ApiBody({ type: UpdateProjectReportDto })
  @ApiResponse({
    status: 200,
    description: "Project report updated successfully.",
  })
  @ApiResponse({ status: 400, description: "Invalid input data." })
  @ApiResponse({ status: 404, description: "Project report, project or submitter not found." })
  async update(
    @Param("id", UuidValidationPipe) id: string,
    @Body() updateProjectReportDto: UpdateProjectReportDto
  ) {
    return this.projectReportService.update(id, updateProjectReportDto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Partially update a project report by ID" })
  @ApiParam({ name: "id", description: "Project Report ID" })
  @ApiBody({ type: UpdateProjectReportDto })
  @ApiResponse({
    status: 200,
    description: "Project report partially updated successfully.",
  })
  @ApiResponse({ status: 400, description: "Invalid input data." })
  @ApiResponse({ status: 404, description: "Project report, project or submitter not found." })
  async patch(
    @Param("id", UuidValidationPipe) id: string,
    @Body() updateProjectReportDto: UpdateProjectReportDto
  ) {
    return this.projectReportService.update(id, updateProjectReportDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a project report by ID" })
  @ApiParam({ name: "id", description: "Project Report ID" })
  @ApiResponse({
    status: 204,
    description: "Project report deleted successfully.",
  })
  @ApiResponse({ status: 404, description: "Project report not found." })
  async remove(@Param("id", UuidValidationPipe) id: string) {
    return this.projectReportService.remove(id);
  }
}
