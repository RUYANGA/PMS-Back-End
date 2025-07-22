import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import { UuidValidationPipe } from "../shared/pipes/uuid-validation.pipe";
import { CreateUserRoleDto } from "./dto/create-user-role.dto";
import { GetUserRolesDto } from "./dto/get-user-roles.dto";
import { UserRolesService } from "./user-roles.service";

@ApiTags("User Roles")
@Controller("user-roles")
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  @Post()
  @ApiOperation({ summary: "Assign a role to a user" })
  @ApiResponse({ status: 201, description: "Role assigned to user successfully." })
  @ApiResponse({ status: 400, description: "Invalid input." })
  @ApiResponse({ status: 404, description: "User or role not found." })
  @ApiResponse({ status: 409, description: "Role already assigned to this user." })
  create(@Body() createUserRoleDto: CreateUserRoleDto) {
    return this.userRolesService.create(createUserRoleDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all user-role assignments" })
  @ApiResponse({ status: 200, description: "List of user-role assignments returned successfully." })
  findAll(@Query() query: GetUserRolesDto) {
    return this.userRolesService.findAll(query);
  }

  @Get("user/:userId")
  @ApiOperation({ summary: "Get roles assigned to a user" })
  @ApiParam({ name: "userId", description: "ID of the user" })
  @ApiResponse({ status: 200, description: "List of roles returned successfully." })
  @ApiResponse({ status: 404, description: "User not found." })
  findUserRoles(
    @Param("userId", UuidValidationPipe) userId: string,
    @Query() query: GetUserRolesDto
  ) {
    return this.userRolesService.findUserRoles(userId, query);
  }

  @Get("role/:roleId")
  @ApiOperation({ summary: "Get users assigned to a role" })
  @ApiParam({ name: "roleId", description: "ID of the role" })
  @ApiResponse({ status: 200, description: "List of users returned successfully." })
  @ApiResponse({ status: 404, description: "Role not found." })
  findRoleUsers(
    @Param("roleId", UuidValidationPipe) roleId: string,
    @Query() query: GetUserRolesDto
  ) {
    return this.userRolesService.findRoleUsers(roleId, query);
  }

  @Delete(":userId/:roleId")
  @ApiOperation({ summary: "Remove a role from a user" })
  @ApiParam({ name: "userId", description: "ID of the user" })
  @ApiParam({ name: "roleId", description: "ID of the role" })
  @ApiResponse({ status: 200, description: "Role removed from user successfully." })
  @ApiResponse({ status: 404, description: "User or role not found, or assignment not found." })
  remove(
    @Param("userId", UuidValidationPipe) userId: string,
    @Param("roleId", UuidValidationPipe) roleId: string
  ) {
    return this.userRolesService.remove(userId, roleId);
  }
}
