import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import { UuidValidationPipe } from "../shared/pipes/uuid-validation.pipe";
import { createProjectDto } from "./dto/create-project.dto";
import { QueryProject } from "./dto/query-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { ProjectsService } from "./projects.service";

@ApiTags("Projects")
@Controller("projects")
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post("/project")
  @ApiOperation({ summary: "Create a new project under an Organisation Unit" })
  @ApiBody({ type: createProjectDto })
  @ApiResponse({ status: 201, description: "Project successfully created" })
  create(@Body() dto: createProjectDto) {
    return this.projectsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "Retrieve all projects" })
  @ApiResponse({ status: 200, description: "List of projects returned" })
  findAll(@Query() query: QueryProject) {
    return this.projectsService.findAll(query);
  }

  @Get("search")
  @ApiOperation({ summary: "Search projects with complex filters" })
  @ApiResponse({ status: 200, description: "List of projects returned" })
  search(@Query() query: QueryProject) {
    return this.projectsService.findAll(query, "/projects/search");
  }

  @Get(":id")
  @ApiOperation({ summary: "Retrieve a project by ID" })
  @ApiParam({ name: "id", description: "Project ID" })
  @ApiResponse({ status: 200, description: "Project found and returned" })
  @ApiResponse({ status: 404, description: "Project not found" })
  findOne(@Param("id", UuidValidationPipe) id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a project by ID" })
  @ApiParam({ name: "id", description: "Project ID" })
  @ApiBody({ type: UpdateProjectDto })
  @ApiResponse({ status: 200, description: "Project successfully updated" })
  @ApiResponse({ status: 404, description: "Project not found" })
  update(@Param("id", UuidValidationPipe) id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a project by ID" })
  @ApiParam({ name: "id", description: "Project ID" })
  @ApiResponse({ status: 200, description: "Project successfully deleted" })
  @ApiResponse({ status: 404, description: "Project not found" })
  remove(@Param("id", UuidValidationPipe) id: string) {
    return this.projectsService.remove(id);
  }
}
