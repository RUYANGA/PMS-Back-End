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
import { CreateStakeholderDto } from "./dto/create-stakeholder.dto";
import { QueryStakeholderDto } from "./dto/query-stakeholder.dto";
import { UpdateStakeholderDto } from "./dto/update-stakeholder.dto";
import { StakeholderService } from "./stakeholder.service";

@ApiTags("Stakeholders")
@Controller("stakeholder")
export class StakeholderController {
  constructor(private readonly stakeholderService: StakeholderService) {}

  @Post()
  @ApiOperation({ summary: "Create a new stakeholder" })
  @ApiBody({ type: CreateStakeholderDto })
  @ApiResponse({
    status: 201,
    description: "The stakeholder has been successfully created.",
  })
  @ApiResponse({ status: 409, description: "Conflict, stakeholder with name already exists." })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createStakeholderDto: CreateStakeholderDto) {
    return this.stakeholderService.create(createStakeholderDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all stakeholders with optional filtering" })
  @ApiResponse({
    status: 200,
    description: "List of stakeholders returned successfully.",
  })
  async findAll(@Query() query: QueryStakeholderDto) {
    return this.stakeholderService.findAll(query);
  }

  @Get("by-type/:stakeholderType")
  @ApiOperation({ summary: "Get stakeholders by type" })
  @ApiParam({ name: "stakeholderType", description: "Type of stakeholder" })
  findByType(@Param("stakeholderType") stakeholderType: string) {
    return this.stakeholderService.findByType(stakeholderType);
  }

  @Get("by-org-unit/:orgUnitId")
  @ApiOperation({ summary: "Get stakeholders by organisation unit" })
  @ApiParam({ name: "orgUnitId", description: "Organisation Unit ID" })
  findByOrganisationUnit(@Param("orgUnitId", UuidValidationPipe) orgUnitId: string) {
    return this.stakeholderService.findByOrganisationUnit(orgUnitId);
  }

  @Get(":id/projects")
  @ApiOperation({ summary: "Get projects for a stakeholder" })
  @ApiParam({ name: "id", description: "Stakeholder ID" })
  getStakeholderProjects(@Param("id", UuidValidationPipe) id: string) {
    return this.stakeholderService.findProjects(id);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a stakeholder by ID" })
  @ApiParam({ name: "id", description: "Stakeholder ID" })
  @ApiResponse({
    status: 200,
    description: "Stakeholder details returned successfully.",
  })
  @ApiResponse({ status: 404, description: "Stakeholder not found." })
  async findOne(@Param("id", UuidValidationPipe) id: string) {
    return this.stakeholderService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a stakeholder by ID" })
  @ApiParam({ name: "id", description: "Stakeholder ID" })
  @ApiBody({ type: UpdateStakeholderDto })
  @ApiResponse({
    status: 200,
    description: "Stakeholder updated successfully.",
  })
  @ApiResponse({ status: 400, description: "Invalid input data." })
  @ApiResponse({ status: 404, description: "Stakeholder not found." })
  @ApiResponse({ status: 409, description: "Conflict, stakeholder with name already exists." })
  async update(
    @Param("id", UuidValidationPipe) id: string,
    @Body() updateStakeholderDto: UpdateStakeholderDto
  ) {
    return this.stakeholderService.update(id, updateStakeholderDto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Partially update a stakeholder by ID" })
  @ApiParam({ name: "id", description: "Stakeholder ID" })
  @ApiBody({ type: UpdateStakeholderDto })
  @ApiResponse({
    status: 200,
    description: "Stakeholder partially updated successfully.",
  })
  @ApiResponse({ status: 400, description: "Invalid input data." })
  @ApiResponse({ status: 404, description: "Stakeholder not found." })
  @ApiResponse({ status: 409, description: "Conflict, stakeholder with name already exists." })
  async patch(
    @Param("id", UuidValidationPipe) id: string,
    @Body() updateStakeholderDto: UpdateStakeholderDto
  ) {
    return this.stakeholderService.update(id, updateStakeholderDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a stakeholder by ID" })
  @ApiParam({ name: "id", description: "Stakeholder ID" })
  @ApiResponse({
    status: 204,
    description: "Stakeholder deleted successfully.",
  })
  @ApiResponse({ status: 404, description: "Stakeholder not found." })
  async remove(@Param("id", UuidValidationPipe) id: string) {
    return this.stakeholderService.remove(id);
  }
}
