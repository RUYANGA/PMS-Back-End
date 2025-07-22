import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import { UuidValidationPipe } from "../shared/pipes/uuid-validation.pipe";
import { CreatePermissionDto } from "./dto/create-permission.dto";
import { QueryPermissionDto } from "./dto/query-permission.dto";
import { UpdatePermissionDto } from "./dto/update-permission.dto";
import { PermissionService } from "./permission.service";

@ApiTags("Permissions")
@Controller("permissions")
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @ApiOperation({ summary: "Create a new permission" })
  @ApiResponse({ status: 201, description: "Permission created successfully." })
  @ApiResponse({ status: 400, description: "Invalid input." })
  @ApiResponse({ status: 409, description: "Permission with code already exists." })
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all permissions with optional filtering" })
  @ApiResponse({ status: 200, description: "List of permissions returned successfully." })
  findAll(@Query() query: QueryPermissionDto) {
    return this.permissionService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a permission by ID" })
  @ApiParam({ name: "id", description: "ID of the permission" })
  @ApiResponse({ status: 200, description: "Return the permission." })
  @ApiResponse({ status: 404, description: "Permission not found." })
  findOne(@Param("id", UuidValidationPipe) id: string) {
    return this.permissionService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Partially update a permission" })
  @ApiParam({ name: "id", description: "ID of the permission" })
  @ApiResponse({ status: 200, description: "The permission has been successfully updated." })
  @ApiResponse({ status: 400, description: "Invalid input." })
  @ApiResponse({ status: 404, description: "Permission not found." })
  update(
    @Param("id", UuidValidationPipe) id: string,
    @Body() updatePermissionDto: UpdatePermissionDto
  ) {
    return this.permissionService.update(id, updatePermissionDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a permission" })
  @ApiParam({ name: "id", description: "ID of the permission" })
  @ApiResponse({ status: 200, description: "The permission has been successfully deleted." })
  @ApiResponse({ status: 404, description: "Permission not found." })
  remove(@Param("id", UuidValidationPipe) id: string) {
    return this.permissionService.remove(id);
  }
}
