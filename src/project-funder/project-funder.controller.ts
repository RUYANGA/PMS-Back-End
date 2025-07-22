import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";

import { UuidValidationPipe } from "../shared/pipes/uuid-validation.pipe";
import { CreateProjectFunderDto } from "./dto/create-project-funder.dto";
import { QueryProjectFunderDto } from "./dto/query-project-funder.dto";
import { UpdateProjectFunderDto } from "./dto/update-project-funder.dto";
import { ProjectFunderService } from "./project-funder.service";

@ApiTags("Project Funders")
@Controller("project-funder")
export class ProjectFunderController {
  constructor(private readonly projectFunderService: ProjectFunderService) {}

  @Post()
  @ApiOperation({ summary: "Link a funder to a project" })
  @ApiBody({ type: CreateProjectFunderDto })
  create(@Body() dto: CreateProjectFunderDto) {
    return this.projectFunderService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "List project funders" })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  findAll(@Query() query: QueryProjectFunderDto) {
    return this.projectFunderService.findAll(query);
  }

  @Get(":projectId/:funderId")
  @ApiOperation({ summary: "Get a specific project-funder record" })
  @ApiParam({ name: "projectId" })
  @ApiParam({ name: "funderId" })
  findOne(
    @Param("projectId", UuidValidationPipe) projectId: string,
    @Param("funderId", UuidValidationPipe) funderId: string
  ) {
    return this.projectFunderService.findOne(projectId, funderId);
  }

  @Patch(":projectId/:funderId")
  @ApiOperation({ summary: "Update a project-funder record" })
  @ApiParam({ name: "projectId" })
  @ApiParam({ name: "funderId" })
  @ApiBody({ type: UpdateProjectFunderDto })
  update(
    @Param("projectId", UuidValidationPipe) projectId: string,
    @Param("funderId", UuidValidationPipe) funderId: string,
    @Body() dto: UpdateProjectFunderDto
  ) {
    return this.projectFunderService.update(projectId, funderId, dto);
  }

  @Delete(":projectId/:funderId")
  @ApiOperation({ summary: "Remove a project-funder record" })
  @ApiParam({ name: "projectId" })
  @ApiParam({ name: "funderId" })
  remove(
    @Param("projectId", UuidValidationPipe) projectId: string,
    @Param("funderId", UuidValidationPipe) funderId: string
  ) {
    return this.projectFunderService.remove(projectId, funderId);
  }
}
