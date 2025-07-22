import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import { UuidValidationPipe } from "../shared/pipes/uuid-validation.pipe";
import { AssignRoleToUserDto } from "./dto/assign-role-to-user.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { GetUserPositionsDto } from "./dto/get-user-positions.dto";
import { QueryUserDto } from "./dto/query-user.dto";
import { SearchUserDto } from "./dto/search-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersService } from "./users.service";

@ApiTags("Users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: "Create a user" })
  @ApiResponse({ status: 201, description: "User created successfully" })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all users with optional filters" })
  @ApiResponse({ status: 200, description: "Filtered list of users returned successfully." })
  async findAll(@Query() Query: SearchUserDto) {
    return this.usersService.findAll(Query);
  }

  @Get("search")
  @ApiOperation({ summary: "Advanced user search" })
  async search(@Query() query: SearchUserDto) {
    return this.usersService.findAll(query);
  }

  @Get("by-type/:userType")
  @ApiOperation({ summary: "Get users by type" })
  @ApiParam({ name: "userType", enum: ["STUDENT", "STAFF", "INDIVIDUAL", "ORGANISATION"] })
  async findByType(
    @Param("userType") userType: "STUDENT" | "STAFF" | "INDIVIDUAL" | "ORGANISATION",
    @Query() query: SearchUserDto
  ) {
    return this.usersService.findAll({ ...query, userType });
  }

  @Get("by-org-unit/:orgUnitId")
  @ApiOperation({ summary: "Get users by organisation unit" })
  @ApiParam({ name: "orgUnitId", type: "string" })
  async findByOrgUnit(
    @Param("orgUnitId", UuidValidationPipe) orgUnitId: string,
    @Query() query: SearchUserDto
  ) {
    return this.usersService.findAll({ ...query, organisationUnitId: orgUnitId });
  }

  @Get("me")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get current user" })
  getMe(@Headers("authorization") auth: string) {
    const token = auth?.split(" ")[1];
    return this.usersService.getMe(token);
  }

  @Put("me")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Update current user" })
  updateMe(@Headers("authorization") auth: string, @Body() dto: UpdateUserDto) {
    const token = auth?.split(" ")[1];
    return this.usersService.updateMe(token, dto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a user by ID" })
  @ApiParam({ name: "id", type: "string" })
  findOne(@Param("id", UuidValidationPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a user" })
  @ApiParam({ name: "id", type: String })
  update(@Param("id", UuidValidationPipe) id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a user" })
  @ApiParam({ name: "id", type: String })
  remove(@Param("id") id: string) {
    return this.usersService.remove(id);
  }

  @Get(":id/roles")
  @ApiOperation({ summary: "Get roles assigned to a user" })
  @ApiParam({ name: "id", description: "ID of the user" })
  @ApiResponse({ status: 200, description: "List of roles returned successfully." })
  @ApiResponse({ status: 404, description: "User not found." })
  getUserRoles(@Param("id", UuidValidationPipe) id: string) {
    return this.usersService.getUserRoles(id);
  }

  @Post(":id/roles")
  @ApiOperation({ summary: "Assign a role to a user" })
  @ApiParam({ name: "id", description: "ID of the user" })
  @ApiResponse({ status: 201, description: "Role assigned to user successfully." })
  @ApiResponse({ status: 400, description: "Invalid input." })
  @ApiResponse({ status: 404, description: "User or role not found." })
  @ApiResponse({ status: 409, description: "Role already assigned to this user." })
  assignRoleToUser(
    @Param("id", UuidValidationPipe) id: string,
    @Body() assignRoleToUserDto: AssignRoleToUserDto
  ) {
    return this.usersService.assignRoleToUser(id, assignRoleToUserDto);
  }

  @Delete(":id/roles/:roleId")
  @ApiOperation({ summary: "Remove a role from a user" })
  @ApiParam({ name: "id", description: "ID of the user" })
  @ApiParam({ name: "roleId", description: "ID of the role" })
  @ApiResponse({ status: 200, description: "Role removed from user successfully." })
  @ApiResponse({ status: 404, description: "User or role not found, or assignment not found." })
  removeRoleFromUser(
    @Param("id", UuidValidationPipe) userId: string,
    @Param("roleId", UuidValidationPipe) roleId: string
  ) {
    return this.usersService.removeRoleFromUser(userId, roleId);
  }

  @Get(":id/positions")
  @ApiOperation({ summary: "Get positions for a user" })
  @ApiParam({ name: "id", description: "ID of the user" })
  getUserPositions(
    @Param("id", UuidValidationPipe) userId: string,
    @Query() query: GetUserPositionsDto
  ) {
    return this.usersService.getUserPositions(userId, query);
  }

  @Get(":id/projects")
  @ApiOperation({ summary: "Get projects for a user" })
  @ApiParam({ name: "id", description: "ID of the user" })
  getUserProjects(@Param("id", UuidValidationPipe) userId: string) {
    return this.usersService.getUserProjects(userId);
  }
}
