import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import { UuidValidationPipe } from "../shared/pipes/uuid-validation.pipe";
import { AssignPermissionToRoleDto } from "./dto/assign-permission-to-role.dto";
import { CreateRoleDto } from "./dto/create-role.dto";
import { QueryRoleDto } from "./dto/query-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { RoleService } from "./role.service";

@ApiTags("Roles")
@Controller("roles")
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @ApiOperation({ summary: "Create a new role" })
  @ApiResponse({ status: 201, description: "Role created successfully." })
  @ApiResponse({ status: 400, description: "Invalid input." })
  @ApiResponse({ status: 409, description: "Role with name already exists in organisation unit." })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all roles with optional filtering" })
  @ApiResponse({ status: 200, description: "List of roles returned successfully." })
  findAll(@Query() query: QueryRoleDto) {
    return this.roleService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a role by ID" })
  @ApiParam({ name: "id", description: "ID of the role" })
  @ApiResponse({ status: 200, description: "Return the role." })
  @ApiResponse({ status: 404, description: "Role not found." })
  findOne(@Param("id", UuidValidationPipe) id: string) {
    return this.roleService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Partially update a role" })
  @ApiParam({ name: "id", description: "ID of the role" })
  @ApiResponse({ status: 200, description: "The role has been successfully updated." })
  @ApiResponse({ status: 400, description: "Invalid input." })
  @ApiResponse({ status: 404, description: "Role not found." })
  update(@Param("id", UuidValidationPipe) id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(id, updateRoleDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a role" })
  @ApiParam({ name: "id", description: "ID of the role" })
  @ApiResponse({ status: 200, description: "The role has been successfully deleted." })
  @ApiResponse({ status: 404, description: "Role not found." })
  remove(@Param("id", UuidValidationPipe) id: string) {
    return this.roleService.remove(id);
  }

  @Get(":id/permissions")
  @ApiOperation({ summary: "Get permissions assigned to a role" })
  @ApiParam({ name: "id", description: "ID of the role" })
  @ApiResponse({ status: 200, description: "List of permissions returned successfully." })
  @ApiResponse({ status: 404, description: "Role not found." })
  getRolePermissions(@Param("id", UuidValidationPipe) roleId: string) {
    return this.roleService.getRolePermissions(roleId);
  }

  @Post(":id/permissions")
  @ApiOperation({ summary: "Assign a permission to a role" })
  @ApiParam({ name: "id", description: "ID of the role" })
  @ApiResponse({ status: 201, description: "Permission assigned to role successfully." })
  @ApiResponse({ status: 400, description: "Invalid input." })
  @ApiResponse({ status: 404, description: "Role or permission not found." })
  @ApiResponse({ status: 409, description: "Permission already assigned to this role." })
  assignPermissionToRole(
    @Param("id", UuidValidationPipe) roleId: string,
    @Body() assignPermissionToRoleDto: AssignPermissionToRoleDto
  ) {
    return this.roleService.assignPermissionToRole(roleId, assignPermissionToRoleDto);
  }

  @Delete(":id/permissions/:permissionId")
  @ApiOperation({ summary: "Remove a permission from a role" })
  @ApiParam({ name: "id", description: "ID of the role" })
  @ApiParam({ name: "permissionId", description: "ID of the permission" })
  @ApiResponse({ status: 200, description: "Permission removed from role successfully." })
  @ApiResponse({
    status: 404,
    description: "Role or permission not found, or assignment not found.",
  })
  removePermissionFromRole(
    @Param("id", UuidValidationPipe) roleId: string,
    @Param("permissionId", UuidValidationPipe) permissionId: string
  ) {
    return this.roleService.removePermissionFromRole(roleId, permissionId);
  }
}
