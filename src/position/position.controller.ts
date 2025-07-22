import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import { UuidValidationPipe } from "../shared/pipes/uuid-validation.pipe";
import { AssignUserToPositionDto } from "./dto/assign-user-to-position.dto";
import { CreatePositionDto } from "./dto/create-position.dto";
import { GetPositionOccupantsDto } from "./dto/get-position-occupants.dto";
import { QueryPositionDto } from "./dto/query-position.dto";
import { UpdatePositionDto } from "./dto/update-position.dto";
import { UpdatePositionOccupancyDto } from "./dto/update-position-occupancy.dto";
import { PositionService } from "./position.service";

@ApiTags("Position")
@Controller("positions")
export class PositionController {
  constructor(private readonly positionService: PositionService) {}

  @Post()
  @ApiOperation({ summary: "Create a new position" })
  @ApiResponse({ status: 201, description: "The position has been successfully created." })
  @ApiResponse({ status: 400, description: "Invalid input." })
  create(@Body() createPositionDto: CreatePositionDto) {
    return this.positionService.create(createPositionDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all positions" })
  @ApiResponse({
    status: 200,
    description: "Return all positions with pagination and filtering.",
  })
  findAll(@Query() query: QueryPositionDto) {
    return this.positionService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a position by ID" })
  @ApiParam({ name: "id", description: "ID of the position" })
  @ApiResponse({ status: 200, description: "Return the position." })
  @ApiResponse({ status: 404, description: "Position not found." })
  findOne(@Param("id", UuidValidationPipe) id: string) {
    return this.positionService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Partially update a position" })
  @ApiParam({ name: "id", description: "ID of the position" })
  @ApiResponse({ status: 200, description: "The position has been successfully updated." })
  @ApiResponse({ status: 400, description: "Invalid input." })
  @ApiResponse({ status: 404, description: "Position not found." })
  patch(@Param("id", UuidValidationPipe) id: string, @Body() updatePositionDto: UpdatePositionDto) {
    return this.positionService.patch(id, updatePositionDto);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a position" })
  @ApiParam({ name: "id", description: "ID of the position" })
  @ApiResponse({ status: 200, description: "The position has been successfully updated." })
  @ApiResponse({ status: 400, description: "Invalid input." })
  @ApiResponse({ status: 404, description: "Position not found." })
  update(
    @Param("id", UuidValidationPipe) id: string,
    @Body() updatePositionDto: UpdatePositionDto
  ) {
    return this.positionService.update(id, updatePositionDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a position" })
  @ApiParam({ name: "id", description: "ID of the position" })
  @ApiResponse({ status: 200, description: "The position has been successfully deleted." })
  @ApiResponse({ status: 404, description: "Position not found." })
  remove(@Param("id", UuidValidationPipe) id: string) {
    return this.positionService.remove(id);
  }

  @Get(":id/occupants")
  @ApiOperation({ summary: "Get occupants of a position" })
  @ApiParam({ name: "id", description: "ID of the position" })
  @ApiResponse({ status: 200, description: "Return occupants of the position." })
  @ApiResponse({ status: 404, description: "Position not found." })
  findOccupants(
    @Param("id", UuidValidationPipe) id: string,
    @Query() query: GetPositionOccupantsDto
  ) {
    return this.positionService.getPositionOccupants(id, query);
  }

  @Post(":id/occupants")
  @ApiOperation({ summary: "Assign a user to a position" })
  @ApiParam({ name: "id", description: "ID of the position" })
  @ApiResponse({ status: 201, description: "User assigned to position successfully." })
  @ApiResponse({ status: 404, description: "Position or user not found." })
  @ApiResponse({ status: 409, description: "User has an overlapping assignment." })
  assignUser(
    @Param("id", UuidValidationPipe) id: string,
    @Body() assignUserToPositionDto: AssignUserToPositionDto
  ) {
    return this.positionService.assignUserToPosition(id, assignUserToPositionDto);
  }

  @Put(":id/occupants/:userId")
  @ApiOperation({ summary: "Update a position occupancy" })
  @ApiParam({ name: "id", description: "ID of the position" })
  @ApiParam({ name: "userId", description: "ID of the user" })
  @ApiResponse({ status: 200, description: "Position occupancy updated successfully." })
  @ApiResponse({ status: 404, description: "Position or user not found." })
  @ApiResponse({ status: 409, description: "User has an overlapping assignment." })
  updateOccupancy(
    @Param("id", UuidValidationPipe) positionId: string,
    @Param("userId", UuidValidationPipe) userId: string,
    @Body() updateData: UpdatePositionOccupancyDto
  ) {
    return this.positionService.updatePositionOccupancy(positionId, userId, updateData);
  }

  @Delete(":id/occupants/:userId")
  @ApiOperation({ summary: "Remove a user from a position" })
  @ApiParam({ name: "id", description: "ID of the position" })
  @ApiParam({ name: "userId", description: "ID of the user" })
  @ApiResponse({ status: 200, description: "User removed from position successfully." })
  @ApiResponse({ status: 404, description: "Position or user not found." })
  removeOccupancy(
    @Param("id", UuidValidationPipe) positionId: string,
    @Param("userId", UuidValidationPipe) userId: string
  ) {
    return this.positionService.removePositionOccupancy(positionId, userId);
  }
}
