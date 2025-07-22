import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";

import { InfrastructureService } from "../infrastructure/infrastructure.service";
import { LoggerService } from "../logger/logger.service";
import { PrismaService } from "../prisma/prisma.service";
import { AssignPermissionToRoleDto } from "./dto/assign-permission-to-role.dto";
import { CreateRoleDto } from "./dto/create-role.dto";
import { QueryRoleDto } from "./dto/query-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";

@Injectable()
export class RoleService {
  constructor(
    private prisma: PrismaService,
    private readonly infrastructure: InfrastructureService,
    private readonly logger: LoggerService
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const { name, organisationUnitId } = createRoleDto;

    if (organisationUnitId) {
      await this.infrastructure.checkRecordExists("organisationUnit", organisationUnitId);
    }

    const existingRole = await this.prisma.role.findFirst({
      where: {
        name,
        organisationUnitId: organisationUnitId || null,
      },
    });

    if (existingRole) {
      throw new ConflictException("Role with this name already exists in this organisation unit.");
    }

    const role = await this.prisma.role.create({
      data: {
        ...createRoleDto,
      },
    });

    return {
      status: true,
      message: "Role created successfully",
      data: role,
      meta: {},
    };
  }

  async findAll(query: QueryRoleDto) {
    const { page = 1, limit = 10, search, organisationUnitId } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (organisationUnitId) {
      where.organisationUnitId = organisationUnitId;
    }

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    const [roles, total] = await this.prisma.$transaction([
      this.prisma.role.findMany({
        where,
        skip,
        take: limit,
        include: {
          organisationUnit: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.role.count({ where }),
    ]);

    return {
      status: true,
      message: "Roles retrieved successfully",
      data: roles,
      meta: this.infrastructure.generatePaginationMeta(total, page, limit, "/roles"),
    };
  }

  async findOne(id: string) {
    const role = await this.infrastructure.checkRecordExists("role", id);
    return {
      status: true,
      message: "Role retrieved successfully",
      data: role,
      meta: {},
    };
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    await this.infrastructure.checkRecordExists("role", id);

    const { name, organisationUnitId } = updateRoleDto;

    if (organisationUnitId) {
      await this.infrastructure.checkRecordExists("organisationUnit", organisationUnitId);
    }

    if (name) {
      const existingRole = await this.prisma.role.findFirst({
        where: {
          name,
          organisationUnitId: organisationUnitId || null,
          NOT: { id },
        },
      });

      if (existingRole) {
        throw new ConflictException(
          "Role with this name already exists in this organisation unit."
        );
      }
    }

    const updatedRole = await this.prisma.role.update({
      where: { id },
      data: updateRoleDto,
    });

    return {
      status: true,
      message: "Role updated successfully",
      data: updatedRole,
      meta: {},
    };
  }

  async remove(id: string) {
    await this.infrastructure.checkRecordExists("role", id);

    const userRolesCount = await this.prisma.userRole.count({
      where: { roleId: id },
    });

    if (userRolesCount > 0) {
      throw new ConflictException("Cannot delete role as it is assigned to users.");
    }

    await this.prisma.role.delete({ where: { id } });

    return {
      status: true,
      message: "Role deleted successfully",
      data: null,
      meta: {},
    };
  }

  async getRolePermissions(roleId: string) {
    await this.infrastructure.checkRecordExists("role", roleId);

    const permissions = await this.prisma.rolePermission.findMany({
      where: { roleId },
      include: {
        permission: {
          select: {
            id: true,
            code: true,
            description: true,
          },
        },
      },
    });

    return {
      status: true,
      message: "Permissions retrieved successfully",
      data: permissions.map((rp) => rp.permission),
      meta: {},
    };
  }

  async assignPermissionToRole(roleId: string, data: AssignPermissionToRoleDto) {
    await this.infrastructure.checkRecordExists("role", roleId);
    await this.infrastructure.checkRecordExists("permission", data.permissionId);

    const existingAssignment = await this.prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId: data.permissionId,
        },
      },
    });

    if (existingAssignment) {
      throw new ConflictException("Permission already assigned to this role");
    }

    const assignment = await this.prisma.rolePermission.create({
      data: {
        roleId,
        permissionId: data.permissionId,
      },
      include: {
        permission: true,
      },
    });

    return {
      status: true,
      message: "Permission assigned to role successfully",
      data: assignment,
      meta: {},
    };
  }

  async removePermissionFromRole(roleId: string, permissionId: string) {
    await this.infrastructure.checkRecordExists("role", roleId);
    await this.infrastructure.checkRecordExists("permission", permissionId);

    const existingAssignment = await this.prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });

    if (!existingAssignment) {
      throw new NotFoundException("Permission assignment not found for this role.");
    }

    await this.prisma.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });

    return {
      status: true,
      message: "Permission removed from role successfully",
      data: null,
      meta: {},
    };
  }
}
