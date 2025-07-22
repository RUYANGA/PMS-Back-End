import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";

import { InfrastructureService } from "../infrastructure/infrastructure.service";
import { LoggerService } from "../logger/logger.service";
import { PrismaService } from "../prisma/prisma.service";
import { GetUserPositionsDto } from "../users/dto/get-user-positions.dto";
import { CreateUserPositionDto } from "./dto/create-user-position.dto";
import { UpdateUserPositionDto } from "./dto/update-user-position.dto";

@Injectable()
export class UserPositionsService {
  constructor(
    private prisma: PrismaService,
    private readonly infrastructure: InfrastructureService,
    private readonly logger: LoggerService
  ) {}

  async create(createUserPositionDto: CreateUserPositionDto) {
    const { userId, positionId, startDate, endDate } = createUserPositionDto;

    await this.infrastructure.checkRecordExists("user", userId);
    await this.infrastructure.checkRecordExists("position", positionId);

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : null;

    // Check for overlapping assignments
    const overlappingAssignment = await this.prisma.userPosition.findFirst({
      where: {
        userId,
        positionId,
        OR: [
          {
            startDate: { lte: start },
            endDate: { gte: start },
          },
          {
            startDate: { lte: end || new Date() },
            endDate: { gte: end || new Date() },
          },
          {
            startDate: { gte: start },
            endDate: { lte: end || new Date() },
          },
        ],
      },
    });

    if (overlappingAssignment) {
      throw new ConflictException("User already has an overlapping assignment for this position.");
    }

    const assignment = await this.prisma.userPosition.create({
      data: {
        userId,
        positionId,
        startDate: start,
        endDate: end,
      },
      include: {
        user: true,
        position: {
          include: {
            organisationUnit: true,
          },
        },
      },
    });

    return {
      status: true,
      message: "User-position assignment created successfully",
      data: assignment,
      meta: {},
    };
  }

  async findAll(query: GetUserPositionsDto) {
    const {
      page = 1,
      limit = 10,
      sortBy,
      sortOrder,
      search,
      userId,
      positionId,
      currentOnly,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (userId) {
      where.userId = userId;
    }
    if (positionId) {
      where.positionId = positionId;
    }

    if (currentOnly) {
      where.OR = [{ endDate: null }, { endDate: { gt: new Date() } }];
    }

    if (search) {
      where.position = {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { organisationUnit: { name: { contains: search, mode: "insensitive" } } },
        ],
      };
    }

    const [assignments, total] = await this.prisma.$transaction([
      this.prisma.userPosition.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: true,
          position: {
            include: {
              organisationUnit: true,
            },
          },
        },
        orderBy: {
          [sortBy || "startDate"]: sortOrder || "desc",
        },
      }),
      this.prisma.userPosition.count({ where }),
    ]);

    return {
      status: true,
      message: "User-position assignments retrieved successfully",
      data: assignments,
      meta: this.infrastructure.generatePaginationMeta(total, page, limit, "/user-positions"),
    };
  }

  async findUserPositions(userId: string, query: GetUserPositionsDto) {
    await this.infrastructure.checkRecordExists("user", userId);

    const { page = 1, limit = 10, sortBy, sortOrder, search, currentOnly } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
    };

    if (currentOnly) {
      where.OR = [{ endDate: null }, { endDate: { gt: new Date() } }];
    }

    if (search) {
      where.position = {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { organisationUnit: { name: { contains: search, mode: "insensitive" } } },
        ],
      };
    }

    const [assignments, total] = await this.prisma.$transaction([
      this.prisma.userPosition.findMany({
        where,
        skip,
        take: limit,
        include: {
          position: {
            include: {
              organisationUnit: true,
            },
          },
        },
        orderBy: {
          [sortBy || "startDate"]: sortOrder || "desc",
        },
      }),
      this.prisma.userPosition.count({ where }),
    ]);

    return {
      status: true,
      message: "User positions retrieved successfully",
      data: assignments,
      meta: this.infrastructure.generatePaginationMeta(
        total,
        page,
        limit,
        `/user-positions/${userId}`
      ),
    };
  }

  async findPositionAssignments(positionId: string, query: GetUserPositionsDto) {
    await this.infrastructure.checkRecordExists("position", positionId);

    const { page = 1, limit = 10, sortBy, sortOrder, search, currentOnly } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      positionId,
    };

    if (currentOnly) {
      where.OR = [{ endDate: null }, { endDate: { gt: new Date() } }];
    }

    if (search) {
      where.user = {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { username: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    const [assignments, total] = await this.prisma.$transaction([
      this.prisma.userPosition.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: true,
        },
        orderBy: {
          [sortBy || "startDate"]: sortOrder || "desc",
        },
      }),
      this.prisma.userPosition.count({ where }),
    ]);

    return {
      status: true,
      message: "Position occupants retrieved successfully",
      data: assignments.map((a) => ({
        ...a.user,
        assignment: { startDate: a.startDate, endDate: a.endDate },
      })),
      meta: this.infrastructure.generatePaginationMeta(
        total,
        page,
        limit,
        `/user-positions/position/${positionId}`
      ),
    };
  }

  async update(
    userId: string,
    positionId: string,
    startDate: Date,
    updateData: UpdateUserPositionDto
  ) {
    await this.infrastructure.checkRecordExists("user", userId);
    await this.infrastructure.checkRecordExists("position", positionId);

    const existingAssignment = await this.prisma.userPosition.findUnique({
      where: {
        userId_positionId_startDate: {
          userId,
          positionId,
          startDate,
        },
      },
    });

    if (!existingAssignment) {
      throw new NotFoundException("User-position assignment not found.");
    }

    const updatedAssignment = await this.prisma.userPosition.update({
      where: {
        userId_positionId_startDate: {
          userId,
          positionId,
          startDate,
        },
      },
      data: {
        startDate: updateData.startDate
          ? new Date(updateData.startDate)
          : existingAssignment.startDate,
        endDate: updateData.endDate ? new Date(updateData.endDate) : existingAssignment.endDate,
      },
      include: {
        user: true,
        position: {
          include: {
            organisationUnit: true,
          },
        },
      },
    });

    return {
      status: true,
      message: "User-position assignment updated successfully",
      data: updatedAssignment,
      meta: {},
    };
  }

  async remove(userId: string, positionId: string, startDate: Date) {
    await this.infrastructure.checkRecordExists("user", userId);
    await this.infrastructure.checkRecordExists("position", positionId);

    const existingAssignment = await this.prisma.userPosition.findUnique({
      where: {
        userId_positionId_startDate: {
          userId,
          positionId,
          startDate,
        },
      },
    });

    if (!existingAssignment) {
      throw new NotFoundException("User-position assignment not found.");
    }

    await this.prisma.userPosition.delete({
      where: {
        userId_positionId_startDate: {
          userId,
          positionId,
          startDate,
        },
      },
    });

    return {
      status: true,
      message: "User-position assignment deleted successfully",
      data: null,
      meta: {},
    };
  }
}
