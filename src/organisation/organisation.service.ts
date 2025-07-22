import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { OrganisationUnit } from "../generated/prisma";
import { InfrastructureService } from "../infrastructure/infrastructure.service";
import { LoggerService } from "../logger/logger.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOrganisationUnitDto } from "./dto/create-organisation-unit.dto";
import { GetOrgUnitProjectsQueryDto } from "./dto/get-org-unit-projects-query.dto";
import { GetOrgUnitStakeholdersQueryDto } from "./dto/get-org-unit-stakeholders-query.dto";
import { GetOrgUnitUsersQueryDto } from "./dto/get-org-unit-users-query.dto";
import { QueryOrganisationUnitDto } from "./dto/query-organisation-unit.dto";
import { UpdateOrganisationUnitDto } from "./dto/update-organisation-unit.dto";

@Injectable()
export class OrganisationService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly infrastructure: InfrastructureService
  ) {}

  /**
   * Creates a new organisation unit.
   * @param createOrganisationUnitDto The data for creating the organisation unit.
   * @returns The newly created organisation unit.
   */
  async create(createOrganisationUnitDto: CreateOrganisationUnitDto) {
    this.logger.log(
      `Creating organisation unit: ${JSON.stringify(createOrganisationUnitDto)}`,
      "OrganisationService"
    );
    const { parentId, name, code } = createOrganisationUnitDto;

    if (parentId) {
      await this.infrastructure.checkRecordExists("organisationUnit", parentId);
    }

    if (code) {
      await this.infrastructure.checkDuplicate("organisationUnit", [
        { property: "code", value: code },
      ]);
    }

    this.logger.debug(`Creating organisation unit in database`, "OrganisationService");
    const result = await this.prisma.organisationUnit.create({
      data: {
        name,
        code,
        parentId,
      },
    });
    this.logger.log(
      `Successfully created organisation unit with ID: ${result.id}`,
      "OrganisationService"
    );
    return {
      status: true,
      message: "Organisation unit created successfully",
      data: result,
      meta: {},
    };
  }

  /**
   * Retrieves all organisation units with pagination and optional search.
   * @param query The query parameters for pagination and search.
   * @returns A list of organisation units and the total count.
   */
  async findAll(query: QueryOrganisationUnitDto) {
    this.logger.log(
      `Retrieving organisation units with query: ${JSON.stringify(query)}`,
      "OrganisationService"
    );
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = "name",
      sortOrder = "asc",
      parentId,
      includePositions = false,
    } = query;
    const skip = (page - 1) * limit;

    // Create the where clause for filtering and searching
    let where: any = {};

    if (search) {
      this.logger.debug(`Applying search filter: ${search}`, "OrganisationService");
      where = {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { code: { contains: search, mode: "insensitive" as const } },
        ],
      };
    }

    // Add parent filter if provided
    if (parentId) {
      this.logger.debug(`Filtering by parent ID: ${parentId}`, "OrganisationService");
      where.parentId = parentId;
    }

    // Determine the sort order
    const orderBy: any = {};
    if (sortBy && ["name", "code", "id", "parentId"].includes(sortBy)) {
      orderBy[sortBy] = sortOrder === "desc" ? "desc" : "asc";
    } else {
      orderBy.name = "asc"; // Default sorting
    }

    this.logger.debug(
      `Executing query with pagination: page=${page}, limit=${limit}, sortBy=${sortBy}, sortOrder=${sortOrder}, includePositions=${includePositions}`,
      "OrganisationService"
    );

    // Define include clause based on includePositions parameter
    const include = includePositions ? { positions: true } : undefined;

    const [organisationUnits, total] = await this.prisma.$transaction([
      this.prisma.organisationUnit.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include,
      }),
      this.prisma.organisationUnit.count({ where }),
    ]);

    this.logger.log(
      `Found ${total} organisation units, returning page ${page} with ${organisationUnits.length} results`,
      "OrganisationService"
    );

    const totalPages = Math.ceil(total / limit);

    return {
      status: true,
      message: "Successfully retrieved items",
      data: organisationUnits,
      meta: {
        pagination: {
          total,
          count: organisationUnits.length,
          perPage: limit,
          currentPage: page,
          totalPages,
          links: {
            first: `/organisation?page=1&limit=${limit}`,
            last: `/organisation?page=${totalPages}&limit=${limit}`,
            prev: page > 1 ? `/organisation?page=${page - 1}&limit=${limit}` : null,
            next: page < totalPages ? `/organisation?page=${page + 1}&limit=${limit}` : null,
          },
        },
      },
    };
  }

  /**
   * Retrieves an organisation unit by its ID.
   * @param id The ID of the organisation unit.
   * @returns The found organisation unit.
   * @throws NotFoundException if the organisation unit is not found.
   * @throws BadRequestException if the ID is not a valid UUID.
   */
  private async getOrganisationUnitById(id: string): Promise<OrganisationUnit> {
    return this.infrastructure.checkRecordExists("organisationUnit", id);
  }

  /**
   * Retrieves an organisation unit by its ID.
   * @param id The ID of the organisation unit.
   * @param includePositions Whether to include positions in the response.
   * @returns The found organisation unit.
   * @throws NotFoundException if the organisation unit is not found.
   * @throws BadRequestException if the ID is not a valid UUID.
   */
  async findOne(id: string, includePositions = false) {
    await this.infrastructure.checkRecordExists("organisationUnit", id);

    const include = includePositions ? { positions: true } : undefined;
    const organisationUnit = await this.prisma.organisationUnit.findUnique({
      where: { id },
      include,
    });

    return {
      status: true,
      message: "Organisation unit retrieved successfully",
      data: organisationUnit,
      meta: {},
    };
  }

  /**
   * Updates an existing organisation unit.
   * @param id The ID of the organisation unit to update.
   * @param updateOrganisationUnitDto The data for updating the organisation unit.
   * @returns The updated organisation unit.
   * @throws NotFoundException if the organisation unit is not found.
   * @throws BadRequestException if the parentId is invalid or code already exists.
   */
  async update(id: string, updateOrganisationUnitDto: UpdateOrganisationUnitDto) {
    this.logger.log(
      `Updating organisation unit ${id} with data: ${JSON.stringify(updateOrganisationUnitDto)}`,
      "OrganisationService"
    );

    const { parentId, code } = updateOrganisationUnitDto;

    await this.getOrganisationUnitById(id); // Check if the organisation unit exists

    if (parentId) {
      await this.infrastructure.checkRecordExists("organisationUnit", parentId);
    }

    if (code) {
      await this.infrastructure.checkDuplicate("organisationUnit", [
        { property: "code", value: code },
      ]);
    }

    this.logger.debug(`Updating organisation unit ${id} in database`, "OrganisationService");
    const result = await this.prisma.organisationUnit.update({
      where: { id },
      data: updateOrganisationUnitDto,
    });

    this.logger.log(`Successfully updated organisation unit ${id}`, "OrganisationService");
    return {
      status: true,
      message: "Organisation unit updated successfully",
      data: result,
      meta: {},
    };
  }

  /**
   * Partially updates an existing organisation unit.
   * @param id The ID of the organisation unit to update.
   * @param updateOrganisationUnitDto The partial data for updating the organisation unit.
   * @returns The updated organisation unit.
   * @throws NotFoundException if the organisation unit is not found.
   * @throws BadRequestException if the parentId is invalid or code already exists.
   */
  async patch(id: string, updateOrganisationUnitDto: UpdateOrganisationUnitDto) {
    this.logger.log(
      `Patching organisation unit ${id} with data: ${JSON.stringify(updateOrganisationUnitDto)}`,
      "OrganisationService"
    );
    return this.update(id, updateOrganisationUnitDto);
  }

  /**
   * Deletes an organisation unit by its ID.
   * @param id The ID of the organisation unit to delete.
   * @returns The deleted organisation unit.
   * @throws NotFoundException if the organisation unit is not found.
   * @throws BadRequestException if the organisation unit has children.
   */
  async remove(id: string) {
    this.logger.log(`Attempting to delete organisation unit: ${id}`, "OrganisationService");

    await this.getOrganisationUnitById(id); // Check if the organisation unit exists

    const hasChildren = await this.prisma.organisationUnit.count({
      where: { parentId: id },
    });

    if (hasChildren > 0) {
      this.logger.warn(
        `Cannot delete organisation unit ${id} as it has ${hasChildren} child units`,
        "OrganisationService"
      );
      throw new BadRequestException(
        `OrganisationUnit with ID ${id} cannot be deleted because it has ${hasChildren} child units.`
      );
    }

    this.logger.debug(`Deleting organisation unit ${id} from database`, "OrganisationService");
    await this.prisma.organisationUnit.delete({
      where: { id },
    });

    this.logger.log(`Successfully deleted organisation unit: ${id}`, "OrganisationService");
    return {
      status: true,
      message: "Organisation unit deleted successfully",
      data: null,
      meta: {},
    };
  }

  /**
   * Retrieves the children of a given organisation unit.
   * @param id The ID of the parent organisation unit.
   * @returns A list of child organisation units.
   * @throws NotFoundException if the parent organisation unit is not found.
   */
  async findChildren(id: string) {
    this.logger.log(`Finding children of organisation unit: ${id}`, "OrganisationService");

    await this.getOrganisationUnitById(id); // Check if the organisation unit exists

    const children = await this.prisma.organisationUnit.findMany({
      where: { parentId: id },
    });

    this.logger.log(
      `Found ${children.length} children for organisation unit ${id}`,
      "OrganisationService"
    );
    return {
      status: true,
      message: "Children retrieved successfully",
      data: children,
      meta: {},
    };
  }

  /**
   * Retrieves the parent of a given organisation unit.
   * @param id The ID of the child organisation unit.
   * @returns The parent organisation unit, or null if no parent.
   * @throws NotFoundException if the child organisation unit is not found.
   */
  async findParent(id: string) {
    this.logger.log(`Finding parent of organisation unit: ${id}`, "OrganisationService");

    const organisationUnit = await this.getOrganisationUnitById(id);

    if (organisationUnit.parentId) {
      this.logger.debug(
        `Organisation unit ${id} has parent ID: ${organisationUnit.parentId}, retrieving parent`,
        "OrganisationService"
      );
      const parent = await this.prisma.organisationUnit.findUnique({
        where: { id: organisationUnit.parentId },
      });
      this.logger.log(
        `Found parent for organisation unit ${id}: ${parent?.id || "not found"}`,
        "OrganisationService"
      );
      return {
        status: true,
        message: "Parent retrieved successfully",
        data: parent,
        meta: {},
      };
    }

    this.logger.log(`Organisation unit ${id} has no parent`, "OrganisationService");
    return {
      status: true,
      message: "Organisation unit has no parent",
      data: null,
      meta: {},
    };
  }

  /**
   * Retrieves the full hierarchy (ancestors) of a given organisation unit.
   * @param id The ID of the organisation unit.
   * @returns A list of organisation units representing the hierarchy from root to the given unit.
   * @throws NotFoundException if the organisation unit is not found.
   */
  async findHierarchy(id: string) {
    this.logger.log(
      `Finding hierarchy (ancestors) for organisation unit: ${id}`,
      "OrganisationService"
    );

    let currentUnit: OrganisationUnit | null = await this.getOrganisationUnitById(id);
    const hierarchy: OrganisationUnit[] = [currentUnit];

    while (currentUnit && currentUnit.parentId) {
      this.logger.debug(`Fetching parent with ID: ${currentUnit.parentId}`, "OrganisationService");
      currentUnit = await this.prisma.organisationUnit.findUnique({
        where: { id: currentUnit.parentId },
      });
      if (currentUnit) {
        this.logger.debug(`Adding parent ${currentUnit.id} to hierarchy`, "OrganisationService");
        hierarchy.unshift(currentUnit); // Add to the beginning of the array
      }
    }

    this.logger.log(
      `Completed hierarchy for unit ${id} with ${hierarchy.length} levels`,
      "OrganisationService"
    );
    return {
      status: true,
      message: "Hierarchy retrieved successfully",
      data: hierarchy,
      meta: {},
    };
  }

  /**
   * Retrieves the full tree structure of organisation units.
   * @param includePositions Whether to include positions in the tree structure.
   * @returns A tree-like structure of organisation units.
   */
  async findTree(includePositions = false) {
    this.logger.log(
      `Generating organisation unit tree structure${includePositions ? " with positions" : ""}`,
      "OrganisationService"
    );

    const include = includePositions ? { positions: true } : undefined;
    const allUnits = await this.prisma.organisationUnit.findMany({ include });
    this.logger.debug(`Retrieved ${allUnits.length} organisation units`, "OrganisationService");

    const unitMap = new Map<string, any>();
    allUnits.forEach((unit) => {
      unitMap.set(unit.id, {
        ...unit,
        children: [],
        ...(includePositions && { positionCount: unit.positions?.length || 0 }),
      });
    });

    const rootUnits: any[] = [];

    this.logger.debug("Constructing tree hierarchy", "OrganisationService");
    unitMap.forEach((unit) => {
      if (unit.parentId) {
        const parent = unitMap.get(unit.parentId);
        if (parent) {
          parent.children.push(unit);
        } else {
          this.logger.warn(
            `Unit ${unit.id} references non-existent parent ${unit.parentId}`,
            "OrganisationService"
          );
        }
      } else {
        rootUnits.push(unit);
      }
    });

    this.logger.log(
      `Tree structure built with ${rootUnits.length} root units`,
      "OrganisationService"
    );
    return {
      status: true,
      message: "Tree retrieved successfully",
      data: rootUnits,
      meta: {},
    };
  }

  /**
   * Adds a child organisation unit to a given parent.
   * @param parentId The ID of the parent organisation unit.
   * @param createOrganisationUnitDto The data for creating the child organisation unit.
   * @returns The newly created child organisation unit.
   * @throws NotFoundException if the parent organisation unit is not found.
   */
  async addChild(parentId: string, createOrganisationUnitDto: CreateOrganisationUnitDto) {
    this.logger.log(`Adding child organisation unit to parent ${parentId}`, "OrganisationService");

    await this.getOrganisationUnitById(parentId); // Check if parent exists

    this.logger.debug(
      `Creating child organisation unit for parent ${parentId}`,
      "OrganisationService"
    );
    const result = await this.create({ ...createOrganisationUnitDto, parentId });

    this.logger.log(
      `Successfully added child ${result.data.id} to parent ${parentId}`,
      "OrganisationService"
    );
    return result;
  }

  /**
   * Retrieves positions within a specific organisation unit.
   * @param orgUnitId The ID of the organisation unit.
   * @returns A list of positions in the specified organisation unit.
   */
  async findPositions(orgUnitId: string) {
    this.logger.log(`Finding positions in organisation unit: ${orgUnitId}`, "OrganisationService");

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
      "OrganisationService"
    );
    return {
      status: true,
      message: "Positions retrieved successfully",
      data: positions,
      meta: {},
    };
  }

  async findUsers(orgUnitId: string, query: GetOrgUnitUsersQueryDto) {
    await this.infrastructure.checkRecordExists("organisationUnit", orgUnitId);

    const { page = 1, limit = 10, sortBy, sortOrder, search, currentOnly } = query;

    const where: any = {
      userPositions: {
        some: {
          position: {
            organisationUnitId: orgUnitId,
          },
        },
      },
    };

    if (currentOnly) {
      where.userPositions.some.OR = [{ endDate: null }, { endDate: { gt: new Date() } }];
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await this.prisma.user.findMany({
      where,
      include: {
        userPositions: {
          where: {
            position: {
              organisationUnitId: orgUnitId,
            },
          },
          include: {
            position: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortBy || "firstName"]: sortOrder || "asc",
      },
    });

    const total = await this.prisma.user.count({ where });

    return {
      status: true,
      message: "Users retrieved successfully",
      data: users.map((u) => ({
        ...u,
        positions: u.userPositions.map((up) => ({
          id: up.position.id,
          title: up.position.title,
          startDate: up.startDate,
          endDate: up.endDate,
        })),
        userPositions: undefined,
      })),
      meta: this.infrastructure.generatePaginationMeta(
        total,
        page,
        limit,
        `/organisation-unit/${orgUnitId}/users`
      ),
    };
  }

  async findProjects(orgUnitId: string, query: GetOrgUnitProjectsQueryDto) {
    await this.infrastructure.checkRecordExists("organisationUnit", orgUnitId);

    const { page = 1, limit = 10, sortBy = "title", sortOrder = "asc", search } = query;

    const where: any = { organisationUnitId: orgUnitId };

    if (search) {
      const searchFilters: any[] = [
        { title: { contains: search, mode: "insensitive" as const } },
        { titleNorm: { contains: search, mode: "insensitive" as const } },
        { abstract: { contains: search, mode: "insensitive" as const } },
        { innovationField: { contains: search, mode: "insensitive" as const } },
      ];

      const validProjectStatus = [
        "PENDING",
        "UNDER_REVIEW",
        "APPROVED",
        "REJECTED",
        "FUNDED",
        "COMPLETED",
        "ARCHIVED",
      ];

      if (validProjectStatus.includes(search.toUpperCase())) {
        searchFilters.push({ status: search.toUpperCase() });
      }

      if (!isNaN(Number(search))) {
        searchFilters.push({ year: Number(search) });
      }

      where.OR = searchFilters;
    }

    const sortableFields = [
      "title",
      "titleNorm",
      "abstract",
      "year",
      "innovationField",
      "submittedAt",
      "progressPercent",
    ];

    const orderBy: any = {};
    if (sortBy && sortableFields.includes(sortBy)) {
      orderBy[sortBy] = sortOrder === "desc" ? "desc" : "asc";
    } else {
      orderBy.title = "asc";
    }

    const [projects, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      status: true,
      message: "Projects retrieved successfully",
      data: projects,
      meta: this.infrastructure.generatePaginationMeta(
        total,
        page,
        limit,
        `/organisation-unit/${orgUnitId}/projects`
      ),
    };
  }

  async findStakeholders(orgUnitId: string, query: GetOrgUnitStakeholdersQueryDto) {
    await this.infrastructure.checkRecordExists("organisationUnit", orgUnitId);

    const { page = 1, limit = 10, sortBy = "name", sortOrder = "asc", search } = query;

    const where: any = { organisationUnitId: orgUnitId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" as const } },
        { stakeholderType: { contains: search, mode: "insensitive" as const } },
        { contactEmail: { contains: search, mode: "insensitive" as const } },
        { contactPhone: { contains: search, mode: "insensitive" as const } },
      ];
    }

    const orderBy: any = {};
    if (sortBy && ["name", "stakeholderType", "id"].includes(sortBy)) {
      orderBy[sortBy] = sortOrder === "desc" ? "desc" : "asc";
    } else {
      orderBy.name = "asc";
    }

    const [stakeholders, total] = await this.prisma.$transaction([
      this.prisma.stakeholder.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
      }),
      this.prisma.stakeholder.count({ where }),
    ]);

    return {
      status: true,
      message: "Stakeholders retrieved successfully",
      data: stakeholders,
      meta: this.infrastructure.generatePaginationMeta(
        total,
        page,
        limit,
        `/organisation-unit/${orgUnitId}/stakeholders`
      ),
    };
  }
}
