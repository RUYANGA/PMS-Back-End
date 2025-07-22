import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";

import { UuidValidationPipe } from "../shared/pipes/uuid-validation.pipe";
import { CreateStartupDto } from "./dto/create-startup.dto";
import { QueryStartupDto } from "./dto/query-startup.dto";
import { UpdateStartupDto } from "./dto/update-startup.dto";
import { StartupService } from "./startup.service";

@ApiTags("Startups")
@Controller("startups")
export class StartupController {
  constructor(private readonly startupService: StartupService) {}

  @Post()
  @ApiOperation({ summary: "Create a startup" })
  @ApiBody({ type: CreateStartupDto })
  @ApiResponse({ status: 201, description: "Startup created" })
  create(@Body() dto: CreateStartupDto) {
    return this.startupService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "List startups" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  findAll(@Query() query: QueryStartupDto) {
    return this.startupService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get startup by id" })
  @ApiParam({ name: "id", description: "Startup ID" })
  @ApiResponse({ status: 200, description: "Startup returned" })
  findOne(@Param("id", UuidValidationPipe) id: string) {
    return this.startupService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a startup" })
  @ApiParam({ name: "id", description: "Startup ID" })
  @ApiBody({ type: UpdateStartupDto })
  update(@Param("id", UuidValidationPipe) id: string, @Body() dto: UpdateStartupDto) {
    return this.startupService.update(id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a startup" })
  @ApiParam({ name: "id", description: "Startup ID" })
  remove(@Param("id", UuidValidationPipe) id: string) {
    return this.startupService.remove(id);
  }

  @Get("by-project/:projectId")
  @ApiOperation({ summary: "Get startup by project ID" })
  @ApiParam({ name: "projectId", description: "Project ID" })
  findByProject(@Param("projectId", UuidValidationPipe) projectId: string) {
    return this.startupService.findByProjectId(projectId);
  }

  @Get("registered")
  @ApiOperation({ summary: "Get registered startups" })
  findRegistered() {
    return this.startupService.findRegistered();
  }

  @Get("by-year/:year")
  @ApiOperation({ summary: "Get startups by year" })
  @ApiParam({ name: "year", description: "Year" })
  findByYear(@Param("year") year: number) {
    return this.startupService.findByYear(Number(year));
  }
}
