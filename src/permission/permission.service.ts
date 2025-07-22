import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";

import { InfrastructureService } from "../infrastructure/infrastructure.service";
import { LoggerService } from "../logger/logger.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePermissionDto } from "./dto/create-permission.dto";
import { QueryPermissionDto } from "./dto/query-permission.dto";
import { UpdatePermissionDto } from "./dto/update-permission.dto";

@Injectable()
export class PermissionService {
  constructor(
    private prisma: PrismaService,
    private readonly infrastructure: InfrastructureService,
    private readonly logger: LoggerService
  ) {}

  async create(createPermissionDto: CreatePermissionDto) {
    const { code } = createPermissionDto;

    const existingPermission = await this.prisma.permission.findUnique({
      where: { code },
    });

    if (existingPermission) {
      throw new ConflictException("Permission with this code already exists.");
    }

    const permission = await this.prisma.permission.create({
      data: createPermissionDto,
    });

    return {
      status: true,
      message: "Permission created successfully",
      data: permission,
      meta: {},
    };
  }

  async findAll(query: QueryPermissionDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [permissions, total] = await this.prisma.$transaction([
      this.prisma.permission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { code: "asc" },
      }),
      this.prisma.permission.count({ where }),
    ]);

    return {
      status: true,
      message: "Permissions retrieved successfully",
      data: permissions,
      meta: this.infrastructure.generatePaginationMeta(total, page, limit, "/permissions"),
    };
  }

  async findOne(id: string) {
    const permission = await this.infrastructure.checkRecordExists("permission", id);
    return {
      status: true,
      message: "Permission retrieved successfully",
      data: permission,
      meta: {},
    };
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto) {
    await this.infrastructure.checkRecordExists("permission", id);

    const { code } = updatePermissionDto;

    if (code) {
      const existingPermission = await this.prisma.permission.findUnique({
        where: { code },
      });

      if (existingPermission && existingPermission.id !== id) {
        throw new ConflictException("Permission with this code already exists.");
      }
    }

    const updatedPermission = await this.prisma.permission.update({
      where: { id },
      data: updatePermissionDto,
    });

    return {
      status: true,
      message: "Permission updated successfully",
      data: updatedPermission,
      meta: {},
    };
  }

  async remove(id: string) {
    await this.infrastructure.checkRecordExists("permission", id);

    const rolePermissionsCount = await this.prisma.rolePermission.count({
      where: { permissionId: id },
    });

    if (rolePermissionsCount > 0) {
      throw new ConflictException("Cannot delete permission as it is assigned to roles.");
    }

    await this.prisma.permission.delete({ where: { id } });

    return {
      status: true,
      message: "Permission deleted successfully",
      data: null,
      meta: {},
    };
  }
}
