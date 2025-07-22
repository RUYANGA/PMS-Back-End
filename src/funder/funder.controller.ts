// funder.controller.ts
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
import { CreateFunderDto } from "./dto/create-funder.dto";
import { QueryFunderDto } from "./dto/query-funder.dto";
import { UpdateFunderDto } from "./dto/update-funder.dto";
import { FunderService } from "./funder.service";

@ApiTags("Funders")
@Controller("funder")
export class FunderController {
  constructor(private readonly funderService: FunderService) {}

  @Post()
  @ApiOperation({ summary: "Create a new funder" })
  @ApiBody({ type: CreateFunderDto })
  @ApiResponse({
    status: 201,
    description: "The funder has been successfully created.",
  })
  @ApiResponse({ status: 409, description: "Conflict, funder with name already exists." })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createFunderDto: CreateFunderDto) {
    return this.funderService.create(createFunderDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all funders with optional filtering" })
  @ApiResponse({
    status: 200,
    description: "List of funders returned successfully.",
  })
  async findAll(@Query() query: QueryFunderDto) {
    return this.funderService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a funder by ID" })
  @ApiParam({ name: "id", description: "Funder ID" })
  @ApiResponse({
    status: 200,
    description: "Funder details returned successfully.",
  })
  @ApiResponse({ status: 404, description: "Funder not found." })
  async findOne(@Param("id", UuidValidationPipe) id: string) {
    return this.funderService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a funder by ID" })
  @ApiParam({ name: "id", description: "Funder ID" })
  @ApiBody({ type: UpdateFunderDto })
  @ApiResponse({
    status: 200,
    description: "Funder updated successfully.",
  })
  @ApiResponse({ status: 400, description: "Invalid input data." })
  @ApiResponse({ status: 404, description: "Funder not found." })
  @ApiResponse({ status: 409, description: "Conflict, funder with name already exists." })
  async update(
    @Param("id", UuidValidationPipe) id: string,
    @Body() updateFunderDto: UpdateFunderDto
  ) {
    return this.funderService.update(id, updateFunderDto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Partially update a funder by ID" })
  @ApiParam({ name: "id", description: "Funder ID" })
  @ApiBody({ type: UpdateFunderDto })
  @ApiResponse({
    status: 200,
    description: "Funder partially updated successfully.",
  })
  @ApiResponse({ status: 400, description: "Invalid input data." })
  @ApiResponse({ status: 404, description: "Funder not found." })
  @ApiResponse({ status: 409, description: "Conflict, funder with name already exists." })
  async patch(
    @Param("id", UuidValidationPipe) id: string,
    @Body() updateFunderDto: UpdateFunderDto
  ) {
    return this.funderService.update(id, updateFunderDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a funder by ID" })
  @ApiParam({ name: "id", description: "Funder ID" })
  @ApiResponse({
    status: 204,
    description: "Funder deleted successfully.",
  })
  @ApiResponse({ status: 404, description: "Funder not found." })
  async remove(@Param("id") id: string) {
    return this.funderService.remove(id);
  }
}
