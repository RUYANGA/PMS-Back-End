import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";

import { InfrastructureService } from "../infrastructure/infrastructure.service";
import { LoggerService } from "../logger/logger.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateStakeholderDto } from "./dto/create-stakeholder.dto";
import { QueryStakeholderDto } from "./dto/query-stakeholder.dto";
import { UpdateStakeholderDto } from "./dto/update-stakeholder.dto";

@Injectable()
export class StakeholderService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly infrastructure: InfrastructureService
  ) {}

  /**
   * Creates a new stakeholder.
   * @param createStakeholderDto The data for creating the stakeholder.
   * @returns The newly created stakeholder.
   */
  async create(createStakeholderDto: CreateStakeholderDto) {
    this.logger.log(
      `Creating a new stakeholder: ${JSON.stringify(createStakeholderDto)}`,
      "StakeholderService"
    );
    await this.infrastructure.checkDuplicate("stakeholder", [
      { property: "name", value: createStakeholderDto.name },
    ]);

    const result = await this.prisma.stakeholder.create({
      data: {
        name: createStakeholderDto.name,
        stakeholderType: createStakeholderDto.stakeholderType,
        contactEmail: createStakeholderDto.contactEmail,
        contactPhone: createStakeholderDto.contactPhone,
      },
    });

    this.logger.log(
      `Successfully created stakeholder with ID : ${result.id}`,
      "StakeholderService"
    );

    return {
      status: true,
      message: "Stakeholder created successfully",
      data: result,
      meta: {},
    };
  }

  /**
   * Retrieves all stakeholders with pagination and optional search.
   * @param query The query parameters for pagination and search.
   * @returns A list of stakeholders and the total count.
   */
  async findAll(query: QueryStakeholderDto) {
    this.logger.log(
      `Retrieving stakeholders with query: ${JSON.stringify(query)}`,
      "StakeholderService"
    );
    const { page = 1, limit = 10, search, sortBy = "name", sortOrder = "asc" } = query;
    const skip = (page - 1) * limit;

    let where: any = {};

    if (search) {
      this.logger.debug(`Applying search filter: ${search}`, "StakeholderService");
      where = {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { stakeholderType: { contains: search, mode: "insensitive" as const } },
          { contactEmail: { contains: search, mode: "insensitive" as const } },
          { contactPhone: { contains: search, mode: "insensitive" as const } },
        ],
      };
    }

    const orderBy: any = {};
    if (sortBy && ["name", "stakeholderType", "id"].includes(sortBy)) {
      orderBy[sortBy] = sortOrder === "desc" ? "desc" : "asc";
    } else {
      orderBy.name = "asc";
    }

    this.logger.debug(
      `Executing query with pagination: page=${page}, limit=${limit}, sortBy=${sortBy}, sortOrder=${sortOrder}`,
      "StakeholderService"
    );

    const [stakeholders, total] = await this.prisma.$transaction([
      this.prisma.stakeholder.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.stakeholder.count({ where }),
    ]);

    this.logger.log(
      `Found ${total} stakeholders, returning page ${page} with ${stakeholders.length} results`,
      "StakeholderService"
    );

    const totalPages = Math.ceil(total / limit);

    return {
      status: true,
      message: "Successfully retrieved items",
      data: stakeholders,
      meta: {
        pagination: {
          total,
          count: stakeholders.length,
          perPage: limit,
          currentPage: page,
          totalPages,
          links: {
            first: `/stakeholder?page=1&limit=${limit}`,
            last: `/stakeholder?page=${totalPages}&limit=${limit}`,
            prev: page > 1 ? `/stakeholder?page=${page - 1}&limit=${limit}` : null,
            next: page < totalPages ? `/stakeholder?page=${page + 1}&limit=${limit}` : null,
          },
        },
      },
    };
  }

  /**
   * Retrieves a stakeholder by its ID.
   * @param id The ID of the stakeholder.
   * @returns The found stakeholder.
   */
  async findOne(id: string) {
    this.logger.log(`Retrieving stakeholder with ID: ${id}`, "StakeholderService");
    const stakeholder = await this.infrastructure.checkRecordExists("stakeholder", id);

    this.logger.log(`Successfully retrieved stakeholder with ID: ${id}`, "StakeholderService");
    return {
      status: true,
      message: "Stakeholder retrieved successfully",
      data: stakeholder,
      meta: {},
    };
  }

  /**
   * Updates an existing stakeholder.
   * @param id The ID of the stakeholder to update.
   * @param updateStakeholderDto The data for updating the stakeholder.
   * @returns The updated stakeholder.
   */
  async update(id: string, updateStakeholderDto: UpdateStakeholderDto) {
    this.logger.log(
      `Updating stakeholder ${id} with data: ${JSON.stringify(updateStakeholderDto)}`,
      "StakeholderService"
    );
    await this.infrastructure.checkRecordExists("stakeholder", id);

    if (updateStakeholderDto.name) {
      await this.infrastructure.checkDuplicate("stakeholder", [
        { property: "name", value: updateStakeholderDto.name },
      ]);
    }

    const result = await this.prisma.stakeholder.update({
      where: { id },
      data: updateStakeholderDto,
    });

    this.logger.log(`Successfully updated stakeholder ${id}`, "StakeholderService");
    return {
      status: true,
      message: "Stakeholder updated successfully",
      data: result,
      meta: {},
    };
  }

  /**
   * Deletes a stakeholder by its ID.
   * @param id The ID of the stakeholder to delete.
   * @returns The deleted stakeholder.
   */
  async remove(id: string) {
    this.logger.log(`Attempting to delete stakeholder: ${id}`, "StakeholderService");
    await this.infrastructure.checkRecordExists("stakeholder", id);

    const result = await this.prisma.stakeholder.delete({
      where: { id },
    });

    this.logger.log(`Successfully deleted stakeholder: ${id}`, "StakeholderService");
    return {
      status: true,
      message: "Stakeholder deleted successfully",
      data: result,
      meta: {},
    };
  }

  async findByType(type: string) {
    const stakeholders = await this.prisma.stakeholder.findMany({
      where: { stakeholderType: type },
    });
    return {
      status: true,
      message: "Stakeholders retrieved successfully",
      data: stakeholders,
      meta: {},
    };
  }

  async findByOrganisationUnit(orgUnitId: string) {
    await this.infrastructure.checkRecordExists("OrganisationUnit", orgUnitId);
    const stakeholders = await this.prisma.stakeholder.findMany({
      where: { organisationUnitId: orgUnitId },
    });
    return {
      status: true,
      message: "Stakeholders retrieved successfully",
      data: stakeholders,
      meta: {},
    };
  }

  async findProjects(id: string) {
    await this.infrastructure.checkRecordExists("stakeholder", id);
    const projects = await this.prisma.projectStakeholder.findMany({
      where: { stakeholderId: id },
      include: { project: true },
    });
    return {
      status: true,
      message: "Stakeholder projects retrieved successfully",
      data: projects.map((p) => p.project),
      meta: {},
    };
  }
}
