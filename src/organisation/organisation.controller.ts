import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";

import { UuidValidationPipe } from "../shared/pipes/uuid-validation.pipe";
import { CreateOrganisationUnitDto } from "./dto/create-organisation-unit.dto";
import { GetOrgUnitProjectsQueryDto } from "./dto/get-org-unit-projects-query.dto";
import { GetOrgUnitStakeholdersQueryDto } from "./dto/get-org-unit-stakeholders-query.dto";
import { GetOrgUnitUsersQueryDto } from "./dto/get-org-unit-users-query.dto";
import { QueryOrganisationUnitDto } from "./dto/query-organisation-unit.dto";
import { UpdateOrganisationUnitDto } from "./dto/update-organisation-unit.dto";
import { OrganisationService } from "./organisation.service";

@ApiTags("Organisation Unit")
@Controller("organisation-unit")
export class OrganisationController {
  constructor(private readonly organisationService: OrganisationService) {}

  @Post()
  @ApiOperation({ summary: "Create a new organisation unit" })
  @ApiResponse({ status: 201, description: "The organisation unit has been successfully created." })
  @ApiResponse({ status: 400, description: "Invalid input." })
  @ApiResponse({ status: 404, description: "Parent not found." })
  create(@Body() createOrganisationUnitDto: CreateOrganisationUnitDto) {
    return this.organisationService.create(createOrganisationUnitDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all organisation units" })
  @ApiResponse({
    status: 200,
    description: "Return all organisation units with pagination and filtering.",
  })
  findAll(@Query() query: QueryOrganisationUnitDto) {
    return this.organisationService.findAll(query);
  }

  @Get("tree")
  @ApiOperation({ summary: "Get organisation units tree structure" })
  @ApiResponse({ status: 200, description: "Return the tree structure." })
  @ApiQuery({
    name: "includePositions",
    type: Boolean,
    required: false,
    description: "Whether to include positions in the tree structure",
  })
  findTree(@Query("includePositions") includePositions?: boolean) {
    return this.organisationService.findTree(includePositions);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get an organisation unit by ID" })
  @ApiParam({ name: "id", description: "ID of the organisation unit" })
  @ApiResponse({ status: 200, description: "Return the organisation unit." })
  @ApiResponse({ status: 404, description: "Organisation unit not found." })
  findOne(@Param("id", UuidValidationPipe) id: string) {
    return this.organisationService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Partially update an organisation unit" })
  @ApiParam({ name: "id", description: "ID of the organisation unit" })
  @ApiResponse({ status: 200, description: "The organisation unit has been successfully updated." })
  @ApiResponse({ status: 400, description: "Invalid input." })
  @ApiResponse({ status: 404, description: "Organisation unit or parent not found." })
  patch(
    @Param("id", UuidValidationPipe) id: string,
    @Body() updateOrganisationUnitDto: UpdateOrganisationUnitDto
  ) {
    return this.organisationService.patch(id, updateOrganisationUnitDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete an organisation unit" })
  @ApiParam({ name: "id", description: "ID of the organisation unit" })
  @ApiResponse({ status: 200, description: "The organisation unit has been successfully deleted." })
  @ApiResponse({ status: 400, description: "Cannot delete organisation unit with children." })
  @ApiResponse({ status: 404, description: "Organisation unit not found." })
  remove(@Param("id", UuidValidationPipe) id: string) {
    return this.organisationService.remove(id);
  }

  @Get(":id/children")
  @ApiOperation({ summary: "Get child organisation units" })
  @ApiParam({ name: "id", description: "ID of the parent organisation unit" })
  @ApiResponse({ status: 200, description: "Return child organisation units." })
  @ApiResponse({ status: 404, description: "Organisation unit not found." })
  findChildren(@Param("id", UuidValidationPipe) id: string) {
    return this.organisationService.findChildren(id);
  }

  @Get(":id/parent")
  @ApiOperation({ summary: "Get parent organisation unit" })
  @ApiParam({ name: "id", description: "ID of the child organisation unit" })
  @ApiResponse({ status: 200, description: "Return parent organisation unit." })
  @ApiResponse({ status: 404, description: "Organisation unit not found." })
  findParent(@Param("id", UuidValidationPipe) id: string) {
    return this.organisationService.findParent(id);
  }

  @Get(":id/hierarchy")
  @ApiOperation({ summary: "Get full hierarchy of an organisation unit" })
  @ApiParam({ name: "id", description: "ID of the organisation unit" })
  @ApiResponse({ status: 200, description: "Return the hierarchy." })
  @ApiResponse({ status: 404, description: "Organisation unit not found." })
  findHierarchy(@Param("id", UuidValidationPipe) id: string) {
    return this.organisationService.findHierarchy(id);
  }

  @Post(":id/children")
  @ApiOperation({ summary: "Add a child organisation unit to a parent" })
  @ApiParam({ name: "id", description: "ID of the parent organisation unit" })
  @ApiResponse({
    status: 201,
    description: "The child organisation unit has been successfully created.",
  })
  @ApiResponse({ status: 400, description: "Invalid input." })
  @ApiResponse({ status: 404, description: "Parent not found." })
  addChild(
    @Param("id", UuidValidationPipe) parentId: string,
    @Body() createOrganisationUnitDto: CreateOrganisationUnitDto
  ) {
    return this.organisationService.addChild(parentId, createOrganisationUnitDto);
  }

  @Get(":id/positions")
  @ApiOperation({ summary: "Get positions in an organisation unit" })
  @ApiParam({ name: "id", description: "ID of the organisation unit" })
  @ApiResponse({ status: 200, description: "Return positions in the organisation unit." })
  @ApiResponse({ status: 404, description: "Organisation unit not found." })
  findPositions(@Param("id", UuidValidationPipe) orgUnitId: string) {
    return this.organisationService.findPositions(orgUnitId);
  }

  @Get(":id/users")
  @ApiOperation({ summary: "Get users in an organisation unit" })
  @ApiParam({ name: "id", description: "ID of the organisation unit" })
  @ApiResponse({ status: 200, description: "Return users in the organisation unit." })
  @ApiResponse({ status: 404, description: "Organisation unit not found." })
  findUsers(
    @Param("id", UuidValidationPipe) orgUnitId: string,
    @Query() query: GetOrgUnitUsersQueryDto
  ) {
    return this.organisationService.findUsers(orgUnitId, query);
  }

  @Get(":id/projects")
  @ApiOperation({ summary: "Get projects in an organisation unit" })
  @ApiParam({ name: "id", description: "ID of the organisation unit" })
  @ApiResponse({ status: 200, description: "Return projects in the organisation unit." })
  @ApiResponse({ status: 404, description: "Organisation unit not found." })
  findProjects(
    @Param("id", UuidValidationPipe) orgUnitId: string,
    @Query() query: GetOrgUnitProjectsQueryDto
  ) {
    return this.organisationService.findProjects(orgUnitId, query);
  }

  @Get(":id/stakeholders")
  @ApiOperation({ summary: "Get stakeholders in an organisation unit" })
  @ApiParam({ name: "id", description: "ID of the organisation unit" })
  @ApiResponse({ status: 200, description: "Return stakeholders in the organisation unit." })
  @ApiResponse({ status: 404, description: "Organisation unit not found." })
  findStakeholders(
    @Param("id", UuidValidationPipe) orgUnitId: string,
    @Query() query: GetOrgUnitStakeholdersQueryDto
  ) {
    return this.organisationService.findStakeholders(orgUnitId, query);
  }
}
