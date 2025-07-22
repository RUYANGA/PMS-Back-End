import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";

import { InfrastructureService } from "../infrastructure/infrastructure.service";
import { LoggerService } from "../logger/logger.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateFunderDto } from "./dto/create-funder.dto";
import { QueryFunderDto } from "./dto/query-funder.dto";
import { UpdateFunderDto } from "./dto/update-funder.dto";

@Injectable()
export class FunderService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly infrastructure: InfrastructureService
  ) {}

  /**
   * Creates a new funder.
   * @param createFunderDto The data for creating the funder.
   * @returns The newly created funder.
   */
  async create(createFunderDto: CreateFunderDto) {
    this.logger.log(`Creating funder: ${JSON.stringify(createFunderDto)}`, "FunderService");

    await this.infrastructure.checkDuplicate("funder", [
      { property: "name", value: createFunderDto.name },
    ]);

    const result = await this.prisma.funder.create({
      data: {
        name: createFunderDto.name,
        funderType: createFunderDto.funderType,
        contactEmail: createFunderDto.contactEmail,
        contactPhone: createFunderDto.contactPhone,
      },
    });

    this.logger.log(`Successfully created funder with ID: ${result.id}`, "FunderService");
    return {
      status: true,
      message: "Funder created successfully",
      data: result,
      meta: {},
    };
  }

  /**
   * Retrieves all funders with pagination and optional search.
   * @param query The query parameters for pagination and search.
   * @returns A list of funders and the total count.
   */
  async findAll(query: QueryFunderDto) {
    this.logger.log(`Retrieving funders with query: ${JSON.stringify(query)}`, "FunderService");
    const { page = 1, limit = 10, search, sortBy = "name", sortOrder = "asc" } = query;
    const skip = (page - 1) * limit;

    let where: any = {};

    if (search) {
      this.logger.debug(`Applying search filter: ${search}`, "FunderService");
      where = {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { funderType: { contains: search, mode: "insensitive" as const } },
          { contactEmail: { contains: search, mode: "insensitive" as const } },
          { contactPhone: { contains: search, mode: "insensitive" as const } },
        ],
      };
    }

    const orderBy: any = {};
    if (sortBy && ["name", "funderType", "id"].includes(sortBy)) {
      orderBy[sortBy] = sortOrder === "desc" ? "desc" : "asc";
    } else {
      orderBy.name = "asc";
    }

    this.logger.debug(
      `Executing query with pagination: page=${page}, limit=${limit}, sortBy=${sortBy}, sortOrder=${sortOrder}`,
      "FunderService"
    );

    const [funders, total] = await this.prisma.$transaction([
      this.prisma.funder.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.funder.count({ where }),
    ]);

    this.logger.log(
      `Found ${total} funders, returning page ${page} with ${funders.length} results`,
      "FunderService"
    );

    const totalPages = Math.ceil(total / limit);

    return {
      status: true,
      message: "Successfully retrieved items",
      data: funders,
      meta: {
        pagination: {
          total,
          count: funders.length,
          perPage: limit,
          currentPage: page,
          totalPages,
          links: {
            first: `/funders?page=1&limit=${limit}`,
            last: `/funders?page=${totalPages}&limit=${limit}`,
            prev: page > 1 ? `/funders?page=${page - 1}&limit=${limit}` : null,
            next: page < totalPages ? `/funders?page=${page + 1}&limit=${limit}` : null,
          },
        },
      },
    };
  }

  /**
   * Retrieves a funder by its ID.
   * @param id The ID of the funder.
   * @returns The found funder.
   */
  async findOne(id: string) {
    this.logger.log(`Retrieving funder with ID: ${id}`, "FunderService");
    const funder = await this.infrastructure.checkRecordExists("funder", id);

    this.logger.log(`Successfully retrieved funder with ID: ${id}`, "FunderService");
    return {
      status: true,
      message: "Funder retrieved successfully",
      data: funder,
      meta: {},
    };
  }

  /**
   * Updates an existing funder.
   * @param id The ID of the funder to update.
   * @param updateFunderDto The data for updating the funder.
   * @returns The updated funder.
   */
  async update(id: string, updateFunderDto: UpdateFunderDto) {
    this.logger.log(
      `Updating funder ${id} with data: ${JSON.stringify(updateFunderDto)}`,
      "FunderService"
    );
    try {
      await this.infrastructure.checkRecordExists("funder", id);

      if (updateFunderDto.name) {
        await this.infrastructure.checkDuplicate("funder", [
          { property: "name", value: updateFunderDto.name },
        ]);
      }

      const result = await this.prisma.funder.update({
        where: { id },
        data: updateFunderDto,
      });

      this.logger.log(`Successfully updated funder ${id}`, "FunderService");
      return {
        status: true,
        message: "Funder updated successfully",
        data: result,
        meta: {},
      };
    } catch (error) {
      this.logger.error(
        `Failed to update funder ${id}: ${error.message}`,
        "FunderService",
        error.stack
      );
      if (error.code === "P2025") {
        throw new NotFoundException(`Funder with id ${id} not found`);
      }
      throw new InternalServerErrorException("Failed to update funder");
    }
  }

  /**
   * Deletes a funder by its ID.
   * @param id The ID of the funder to delete.
   * @returns The deleted funder.
   */
  async remove(id: string) {
    this.logger.log(`Attempting to delete funder: ${id}`, "FunderService");
    try {
      await this.infrastructure.checkRecordExists("funder", id);

      const result = await this.prisma.funder.delete({
        where: { id },
      });

      this.logger.log(`Successfully deleted funder: ${id}`, "FunderService");
      return {
        status: true,
        message: "Funder deleted successfully",
        data: result,
        meta: {},
      };
    } catch (error) {
      this.logger.error(
        `Failed to delete funder ${id}: ${error.message}`,
        "FunderService",
        error.stack
      );
      if (error.code === "P2025") {
        throw new NotFoundException(`Funder with id ${id} not found`);
      }
      throw new InternalServerErrorException("Failed to delete funder");
    }
  }
}
