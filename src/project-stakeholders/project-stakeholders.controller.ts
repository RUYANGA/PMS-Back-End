import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import { UuidValidationPipe } from "../shared/pipes/uuid-validation.pipe";
import { CreateProjectStakeholderDto } from "./dto/create-project-stakeholder.dto";
import { UpdateProjectStakeholderDto } from "./dto/update-project-stakeholder.dto";
import { ProjectStakeholdersService } from "./project-stakeholders.service";

@ApiTags("Project Stakeholders")
@Controller()
export class ProjectStakeholdersController {
  constructor(private readonly service: ProjectStakeholdersService) {}

  @Get("project-stakeholders")
  @ApiOperation({ summary: "List all project stakeholders" })
  @ApiResponse({ status: 200, description: "List retrieved successfully" })
  findAll() {
    return this.service.findAll();
  }

  @Get("projects/:id/stakeholders")
  @ApiOperation({ summary: "Get stakeholders for a project" })
  @ApiParam({ name: "id", description: "Project ID" })
  @ApiResponse({ status: 200, description: "Stakeholders retrieved" })
  findByProject(@Param("id", UuidValidationPipe) projectId: string) {
    return this.service.findByProject(projectId);
  }

  @Post("projects/:id/stakeholders")
  @ApiOperation({ summary: "Add stakeholder to project" })
  @ApiParam({ name: "id", description: "Project ID" })
  @ApiBody({ type: CreateProjectStakeholderDto })
  @ApiResponse({ status: 201, description: "Stakeholder added" })
  create(
    @Param("id", UuidValidationPipe) projectId: string,
    @Body() dto: CreateProjectStakeholderDto
  ) {
    return this.service.create(projectId, dto);
  }

  @Put("projects/:id/stakeholders/:stakeholderId")
  @ApiOperation({ summary: "Update project stakeholder" })
  @ApiParam({ name: "id", description: "Project ID" })
  @ApiParam({ name: "stakeholderId", description: "Stakeholder ID" })
  @ApiBody({ type: UpdateProjectStakeholderDto })
  @ApiResponse({ status: 200, description: "Stakeholder updated" })
  update(
    @Param("id", UuidValidationPipe) projectId: string,
    @Param("stakeholderId", UuidValidationPipe) stakeholderId: string,
    @Body() dto: UpdateProjectStakeholderDto
  ) {
    return this.service.update(projectId, stakeholderId, dto);
  }

  @Delete("projects/:id/stakeholders/:stakeholderId")
  @ApiOperation({ summary: "Remove stakeholder from project" })
  @ApiParam({ name: "id", description: "Project ID" })
  @ApiParam({ name: "stakeholderId", description: "Stakeholder ID" })
  @ApiResponse({ status: 200, description: "Stakeholder removed" })
  remove(
    @Param("id", UuidValidationPipe) projectId: string,
    @Param("stakeholderId", UuidValidationPipe) stakeholderId: string
  ) {
    return this.service.remove(projectId, stakeholderId);
  }
}
