import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import { UuidValidationPipe } from "../shared/pipes/uuid-validation.pipe";
import { GetUserPositionsDto } from "../users/dto/get-user-positions.dto";
import { CreateUserPositionDto } from "./dto/create-user-position.dto";
import { UpdateUserPositionDto } from "./dto/update-user-position.dto";
import { UserPositionsService } from "./user-positions.service";

@ApiTags("User Positions")
@Controller("user-positions")
export class UserPositionsController {
  constructor(private readonly userPositionsService: UserPositionsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new user-position assignment" })
  @ApiResponse({ status: 201, description: "User-position assignment created successfully." })
  @ApiResponse({ status: 400, description: "Invalid input." })
  @ApiResponse({ status: 404, description: "User or position not found." })
  @ApiResponse({ status: 409, description: "Overlapping assignment exists." })
  create(@Body() createUserPositionDto: CreateUserPositionDto) {
    return this.userPositionsService.create(createUserPositionDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all user-position assignments" })
  @ApiResponse({
    status: 200,
    description: "List of user-position assignments returned successfully.",
  })
  findAll(@Query() query: GetUserPositionsDto) {
    return this.userPositionsService.findAll(query);
  }

  @Get("user/:userId")
  @ApiOperation({ summary: "Get all positions for a specific user" })
  @ApiParam({ name: "userId", description: "ID of the user" })
  @ApiResponse({ status: 200, description: "List of user positions returned successfully." })
  @ApiResponse({ status: 404, description: "User not found." })
  findUserPositions(
    @Param("userId", UuidValidationPipe) userId: string,
    @Query() query: GetUserPositionsDto
  ) {
    return this.userPositionsService.findUserPositions(userId, query);
  }

  @Get("position/:positionId")
  @ApiOperation({ summary: "Get all users for a specific position" })
  @ApiParam({ name: "positionId", description: "ID of the position" })
  @ApiResponse({ status: 200, description: "List of users returned successfully." })
  @ApiResponse({ status: 404, description: "Position not found." })
  findPositionAssignments(
    @Param("positionId", UuidValidationPipe) positionId: string,
    @Query() query: GetUserPositionsDto
  ) {
    return this.userPositionsService.findPositionAssignments(positionId, query);
  }

  @Patch(":userId/:positionId/:startDate")
  @ApiOperation({ summary: "Update a user-position assignment" })
  @ApiParam({ name: "userId", description: "ID of the user" })
  @ApiParam({ name: "positionId", description: "ID of the position" })
  @ApiParam({
    name: "startDate",
    description: "Start date of the assignment (YYYY-MM-DDTHH:mm:ss.sssZ)",
  })
  @ApiResponse({ status: 200, description: "User-position assignment updated successfully." })
  @ApiResponse({ status: 400, description: "Invalid input." })
  @ApiResponse({ status: 404, description: "Assignment not found." })
  update(
    @Param("userId", UuidValidationPipe) userId: string,
    @Param("positionId", UuidValidationPipe) positionId: string,
    @Param("startDate") startDate: string,
    @Body() updateUserPositionDto: UpdateUserPositionDto
  ) {
    return this.userPositionsService.update(
      userId,
      positionId,
      new Date(startDate),
      updateUserPositionDto
    );
  }

  @Put(":userId/:positionId")
  @ApiOperation({ summary: "Update a user-position assignment" })
  @ApiParam({ name: "userId", description: "ID of the user" })
  @ApiParam({ name: "positionId", description: "ID of the position" })
  @ApiResponse({ status: 200, description: "User-position assignment updated successfully." })
  @ApiResponse({ status: 400, description: "Invalid input." })
  @ApiResponse({ status: 404, description: "Assignment not found." })
  updateWithQuery(
    @Param("userId", UuidValidationPipe) userId: string,
    @Param("positionId", UuidValidationPipe) positionId: string,
    @Query("startDate") startDate: string,
    @Body() updateUserPositionDto: UpdateUserPositionDto
  ) {
    return this.userPositionsService.update(
      userId,
      positionId,
      new Date(startDate),
      updateUserPositionDto
    );
  }

  @Delete(":userId/:positionId/:startDate")
  @ApiOperation({ summary: "Delete a user-position assignment" })
  @ApiParam({ name: "userId", description: "ID of the user" })
  @ApiParam({ name: "positionId", description: "ID of the position" })
  @ApiParam({
    name: "startDate",
    description: "Start date of the assignment (YYYY-MM-DDTHH:mm:ss.sssZ)",
  })
  @ApiResponse({ status: 200, description: "User-position assignment deleted successfully." })
  @ApiResponse({ status: 404, description: "Assignment not found." })
  remove(
    @Param("userId", UuidValidationPipe) userId: string,
    @Param("positionId", UuidValidationPipe) positionId: string,
    @Param("startDate") startDate: string
  ) {
    return this.userPositionsService.remove(userId, positionId, new Date(startDate));
  }

  @Delete(":userId/:positionId")
  @ApiOperation({ summary: "Delete a user-position assignment" })
  @ApiParam({ name: "userId", description: "ID of the user" })
  @ApiParam({ name: "positionId", description: "ID of the position" })
  @ApiResponse({ status: 200, description: "User-position assignment deleted successfully." })
  @ApiResponse({ status: 404, description: "Assignment not found." })
  removeWithQuery(
    @Param("userId", UuidValidationPipe) userId: string,
    @Param("positionId", UuidValidationPipe) positionId: string,
    @Query("startDate") startDate: string
  ) {
    return this.userPositionsService.remove(userId, positionId, new Date(startDate));
  }
}
