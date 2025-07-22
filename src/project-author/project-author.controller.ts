import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import { UuidValidationPipe } from "../shared/pipes/uuid-validation.pipe";
import { CreateProjectAuthorDto } from "./dto/create-project-author.dto";
import { UpdateProjectAuthorDto } from "./dto/update-project-author.dto";
import { ProjectAuthorService } from "./project-author.service";

@ApiTags("Project Authors")
@Controller("project-author")
export class ProjectAuthorController {
  constructor(private readonly projectAuthorService: ProjectAuthorService) {}

  @ApiOperation({ summary: "Create a project author" })
  @ApiResponse({ status: 201, description: "Project author created successfully" })
  @ApiResponse({ status: 400, description: "Invalid input" })
  @ApiBody({ type: CreateProjectAuthorDto })
  @Post()
  create(@Body() createProjectAuthorDto: CreateProjectAuthorDto) {
    return this.projectAuthorService.create(createProjectAuthorDto);
  }

  @Get()
  findAll() {
    return this.projectAuthorService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a project author by ID" })
  @ApiParam({ name: "id", type: "string" })
  findOne(@Param("id", UuidValidationPipe) id: string) {
    return this.projectAuthorService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id", UuidValidationPipe) id: string,
    @Body() updateProjectAuthorDto: UpdateProjectAuthorDto
  ) {
    return this.projectAuthorService.update(id, updateProjectAuthorDto);
  }

  @Delete(":id")
  remove(@Param("id", UuidValidationPipe) id: string) {
    return this.projectAuthorService.remove(id);
  }
}
