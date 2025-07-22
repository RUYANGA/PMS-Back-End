import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";

import { Position } from "../generated/prisma";
import { InfrastructureService } from "../infrastructure/infrastructure.service";
import { LoggerService } from "../logger/logger.service";
import { PrismaService } from "../prisma/prisma.service";
import { AssignUserToPositionDto } from "./dto/assign-user-to-position.dto";
import { CreatePositionDto } from "./dto/create-position.dto";
import { GetPositionOccupantsDto } from "./dto/get-position-occupants.dto";
import { QueryPositionDto } from "./dto/query-position.dto";
import { UpdatePositionDto } from "./dto/update-position.dto";
import { UpdatePositionOccupancyDto } from "./dto/update-position-occupancy.dto";

@Injectable()
export class PositionService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly infrastructure: InfrastructureService
  ) {}

  /**
   * Creates a new position.
   * @param createPositionDto The data for creating the position.
   * @returns The newly created position.
   */
  async create(createPositionDto: CreatePositionDto) {
    this.logger.log(`Creating position: ${JSON.stringify(createPositionDto)}`, "PositionService");
    const { organisationUnitId, title, description } = createPositionDto;

    await this.infrastructure.checkRecordExists("organisationUnit", organisationUnitId);

    await this.infrastructure.checkDuplicate("position", [{ property: "title", value: title }]);

    this.logger.debug(`Creating position in database`, "PositionService");
    const result = await this.prisma.position.create({
      data: {
        title,
        description,
        organisationUnit: {
          connect: { id: organisationUnitId },
        },
      },
      include: {
        organisationUnit: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
    this.logger.log(`Successfully created position with ID: ${result.id}`, "PositionService");
    return {
      status: true,
      message: "Position created successfully",
      data: result,
      meta: {},
    };
  }

  /**
   * Retrieves all positions with pagination and optional search.
   * @param query The query parameters for pagination and search.
   * @returns A list of positions and the total count.
   */
  async findAll(query: QueryPositionDto) {
    this.logger.log(`Retrieving positions with query: ${JSON.stringify(query)}`, "PositionService");
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = "title",
      sortOrder = "asc",
      organisationUnitId,
    } = query;
    const skip = (page - 1) * limit;

    let where: any = {};

    if (search) {
      this.logger.debug(`Applying search filter: ${search}`, "PositionService");
      where = {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      };
    }

    if (organisationUnitId) {
      this.logger.debug(
        `Filtering by organisation unit ID: ${organisationUnitId}`,
        "PositionService"
      );
      where.organisationUnitId = organisationUnitId;
    }

    const orderBy: any = {};
    if (sortBy && ["title", "description", "id", "organisationUnitId"].includes(sortBy)) {
      orderBy[sortBy] = sortOrder === "desc" ? "desc" : "asc";
    } else {
      orderBy.title = "asc";
    }

    this.logger.debug(
      `Executing query with pagination: page=${page}, limit=${limit}, sortBy=${sortBy}, sortOrder=${sortOrder}`,
      "PositionService"
    );

    const [positions, total] = await this.prisma.$transaction([
      this.prisma.position.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          organisationUnit: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      }),
      this.prisma.position.count({ where }),
    ]);

    this.logger.log(
      `Found ${total} positions, returning page ${page} with ${positions.length} results`,
      "PositionService"
    );

    const totalPages = Math.ceil(total / limit);

    return {
      status: true,
      message: "Successfully retrieved items",
      data: positions,
      meta: {
        pagination: {
          total,
          count: positions.length,
          perPage: limit,
          currentPage: page,
          totalPages,
          links: {
            first: `/positions?page=1&limit=${limit}`,
            last: `/positions?page=${totalPages}&limit=${limit}`,
            prev: page > 1 ? `/positions?page=${page - 1}&limit=${limit}` : null,
            next: page < totalPages ? `/positions?page=${page + 1}&limit=${limit}` : null,
          },
        },
      },
    };
  }

  /**
   * Retrieves a position by its ID.
   * @param id The ID of the position.
   * @returns The found position.
   */
  async findOne(id: string) {
    const position = await this.getPositionById(id);

    // Get full position with organisation unit details
    const fullPosition = await this.prisma.position.findUnique({
      where: { id },
      include: {
        organisationUnit: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return {
      status: true,
      message: "Position retrieved successfully",
      data: fullPosition,
      meta: {},
    };
  }

  /**
   * Updates an existing position.
   * @param id The ID of the position to update.
   * @param updatePositionDto The data for updating the position.
   * @returns The updated position.
   */
  async update(id: string, updatePositionDto: UpdatePositionDto) {
    this.logger.log(
      `Updating position ${id} with data: ${JSON.stringify(updatePositionDto)}`,
      "PositionService"
    );

    const { organisationUnitId, title } = updatePositionDto;

    await this.getPositionById(id);

    if (organisationUnitId) {
      await this.infrastructure.checkRecordExists("organisationUnit", organisationUnitId);
    }

    if (title) {
      await this.infrastructure.checkDuplicate("position", [{ property: "title", value: title }]);
    }

    this.logger.debug(`Updating position ${id} in database`, "PositionService");
    const result = await this.prisma.position.update({
      where: { id },
      data: {
        title: updatePositionDto.title,
        description: updatePositionDto.description,
        organisationUnit: organisationUnitId ? { connect: { id: organisationUnitId } } : undefined,
      },
      include: {
        organisationUnit: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    this.logger.log(`Successfully updated position ${id}`, "PositionService");
    return {
      status: true,
      message: "Position updated successfully",
      data: result,
      meta: {},
    };
  }

  /**
   * Partially updates an existing position.
   * @param id The ID of the position to update.
   * @param updatePositionDto The partial data for updating the position.
   * @returns The updated position.
   */
  async patch(id: string, updatePositionDto: UpdatePositionDto) {
    this.logger.log(
      `Patching position ${id} with data: ${JSON.stringify(updatePositionDto)}`,
      "PositionService"
    );
    return this.update(id, updatePositionDto);
  }

  /**
   * Deletes a position by its ID.
   * @param id The ID of the position to delete.
   * @returns The deleted position.
   */
  async remove(id: string) {
    this.logger.log(`Attempting to delete position: ${id}`, "PositionService");

    await this.getPositionById(id);

    this.logger.debug(`Deleting position ${id} from database`, "PositionService");
    await this.prisma.position.delete({
      where: { id },
    });

    this.logger.log(`Successfully deleted position: ${id}`, "PositionService");
    return {
      status: true,
      message: "Position deleted successfully",
      data: null,
      meta: {},
    };
  }

  /**
   * Retrieves positions within a specific organisation unit.
   * @param orgUnitId The ID of the organisation unit.
   * @returns A list of positions in the specified organisation unit.
   */
  async findPositionsInOrgUnit(orgUnitId: string) {
    this.logger.log(`Finding positions in organisation unit: ${orgUnitId}`, "PositionService");

    await this.infrastructure.checkRecordExists("organisationUnit", orgUnitId);

    const positions = await this.prisma.position.findMany({
      where: { organisationUnitId: orgUnitId },
      include: {
        organisationUnit: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    this.logger.log(
      `Found ${positions.length} positions for organisation unit ${orgUnitId}`,
      "PositionService"
    );
    return {
      status: true,
      message: "Positions retrieved successfully",
      data: positions,
      meta: {},
    };
  }

  private async getPositionById(id: string): Promise<Position> {
    return this.infrastructure.checkRecordExists("position", id);
  }

  async getPositionOccupants(positionId: string, query: GetPositionOccupantsDto) {
    await this.infrastructure.checkRecordExists("position", positionId);

    const { page = 1, limit = 10, sortBy, sortOrder, search, currentOnly } = query;

    const where: any = {
      positionId: positionId,
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

    const userPositions = await this.prisma.userPosition.findMany({
      where,
      include: {
        user: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        user: {
          [sortBy || "firstName"]: sortOrder || "asc",
        },
      },
    });

    const total = await this.prisma.userPosition.count({ where });

    return {
      status: true,
      message: "Occupants retrieved successfully",
      data: userPositions.map((up) => ({
        ...up.user,
        assignment: {
          startDate: up.startDate,
          endDate: up.endDate,
        },
      })),
      meta: this.infrastructure.generatePaginationMeta(
        total,
        page,
        limit,
        `/positions/${positionId}/occupants`
      ),
    };
  }

  async assignUserToPosition(positionId: string, assignmentData: AssignUserToPositionDto) {
    await this.infrastructure.checkRecordExists("position", positionId);
    await this.infrastructure.checkRecordExists("user", assignmentData.userId);

    const { userId, startDate, endDate } = assignmentData;

    const overlappingAssignment = await this.prisma.userPosition.findFirst({
      where: {
        userId,
        positionId,
        OR: [
          {
            startDate: { lte: startDate || new Date() },
            endDate: { gte: startDate || new Date() },
          },
          {
            startDate: { lte: endDate || new Date() },
            endDate: { gte: endDate || new Date() },
          },
        ],
      },
    });

    if (overlappingAssignment) {
      throw new ConflictException("User has an overlapping assignment for this position.");
    }

    const assignment = await this.prisma.userPosition.create({
      data: {
        positionId,
        userId,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
      },
      include: {
        user: true,
        position: true,
      },
    });

    return {
      status: true,
      message: "User assigned to position successfully",
      data: assignment,
      meta: {},
    };
  }

  async updatePositionOccupancy(
    positionId: string,
    userId: string,
    updateData: UpdatePositionOccupancyDto
  ) {
    await this.infrastructure.checkRecordExists("position", positionId);
    await this.infrastructure.checkRecordExists("user", userId);

    const whereClause: any = {
      userId,
      positionId,
    };

    if (updateData.originalStartDate) {
      whereClause.startDate = new Date(updateData.originalStartDate);
    } else {
      whereClause.endDate = null; // Assume current active assignment if no originalStartDate is provided
    }

    const currentAssignment = await this.prisma.userPosition.findFirst({
      where: whereClause,
    });

    if (!currentAssignment) {
      throw new NotFoundException("Position assignment not found.");
    }

    const updatedAssignment = await this.prisma.userPosition.update({
      where: {
        userId_positionId_startDate: {
          userId: currentAssignment.userId,
          positionId: currentAssignment.positionId,
          startDate: currentAssignment.startDate,
        },
      },
      data: {
        startDate: updateData.startDate
          ? new Date(updateData.startDate)
          : currentAssignment.startDate,
        endDate: updateData.endDate ? new Date(updateData.endDate) : currentAssignment.endDate,
      },
      include: {
        user: true,
        position: true,
      },
    });

    return {
      status: true,
      message: "Position occupancy updated successfully",
      data: updatedAssignment,
      meta: {},
    };
  }

  async removePositionOccupancy(positionId: string, userId: string) {
    await this.infrastructure.checkRecordExists("position", positionId);
    await this.infrastructure.checkRecordExists("user", userId);

    const currentAssignment = await this.prisma.userPosition.findFirst({
      where: {
        userId,
        positionId,
        OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
      },
    });

    if (!currentAssignment) {
      throw new NotFoundException("Active position assignment not found");
    }

    const endedAssignment = await this.prisma.userPosition.update({
      where: {
        userId_positionId_startDate: {
          userId: currentAssignment.userId,
          positionId: currentAssignment.positionId,
          startDate: currentAssignment.startDate,
        },
      },
      data: {
        endDate: new Date(),
      },
    });

    return {
      status: true,
      message: "Position occupancy ended successfully",
      data: endedAssignment,
      meta: {},
    };
  }
}
