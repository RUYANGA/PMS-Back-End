import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";

import { InfrastructureService } from "../infrastructure/infrastructure.service";
import { LoggerService } from "../logger/logger.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserRoleDto } from "./dto/create-user-role.dto";
import { GetUserRolesDto } from "./dto/get-user-roles.dto";

@Injectable()
export class UserRolesService {
  constructor(
    private prisma: PrismaService,
    private readonly infrastructure: InfrastructureService,
    private readonly logger: LoggerService
  ) {}

  async create(data: CreateUserRoleDto) {
    const { userId, roleId } = data;
    await this.infrastructure.checkRecordExists("user", userId);
    await this.infrastructure.checkRecordExists("role", roleId);

    const existing = await this.prisma.userRole.findUnique({
      where: { userId_roleId: { userId, roleId } },
    });

    if (existing) {
      throw new ConflictException("Role already assigned to this user");
    }

    const assignment = await this.prisma.userRole.create({
      data: { userId, roleId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        role: {
          include: { organisationUnit: true },
        },
      },
    });

    return {
      status: true,
      message: "Role assigned to user successfully",
      data: assignment,
      meta: {},
    };
  }

  async findAll(query: GetUserRolesDto) {
    const { page = 1, limit = 10, userId, roleId, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId) where.userId = userId;
    if (roleId) where.roleId = roleId;

    if (search) {
      where.OR = [
        { user: { firstName: { contains: search, mode: "insensitive" } } },
        { user: { lastName: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { role: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [assignments, total] = await this.prisma.$transaction([
      this.prisma.userRole.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          role: { include: { organisationUnit: true } },
        },
        orderBy: { [sortBy || "createdAt"]: sortOrder || "desc" },
      }),
      this.prisma.userRole.count({ where }),
    ]);

    return {
      status: true,
      message: "User roles retrieved successfully",
      data: assignments,
      meta: this.infrastructure.generatePaginationMeta(total, page, limit, "/user-roles"),
    };
  }

  async findUserRoles(userId: string, query: GetUserRolesDto) {
    await this.infrastructure.checkRecordExists("user", userId);
    return this.findAll({ ...query, userId });
  }

  async findRoleUsers(roleId: string, query: GetUserRolesDto) {
    await this.infrastructure.checkRecordExists("role", roleId);
    return this.findAll({ ...query, roleId });
  }

  async remove(userId: string, roleId: string) {
    await this.infrastructure.checkRecordExists("user", userId);
    await this.infrastructure.checkRecordExists("role", roleId);

    const existing = await this.prisma.userRole.findUnique({
      where: { userId_roleId: { userId, roleId } },
    });

    if (!existing) {
      throw new NotFoundException("Role assignment not found for this user");
    }

    await this.prisma.userRole.delete({
      where: { userId_roleId: { userId, roleId } },
    });

    return {
      status: true,
      message: "Role removed from user successfully",
      data: null,
      meta: {},
    };
  }
}
