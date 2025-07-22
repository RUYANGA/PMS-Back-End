import { Injectable } from "@nestjs/common";

import { InfrastructureService } from "../infrastructure/infrastructure.service";
import { LoggerService } from "../logger/logger.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateStartupDto } from "./dto/create-startup.dto";
import { QueryStartupDto } from "./dto/query-startup.dto";
import { UpdateStartupDto } from "./dto/update-startup.dto";

@Injectable()
export class StartupService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly infrastructure: InfrastructureService
  ) {}

  async create(dto: CreateStartupDto) {
    this.logger.log(`Creating startup: ${JSON.stringify(dto)}`, "StartupService");

    await this.infrastructure.checkRecordExists("project", dto.projectId);

    const startup = await this.prisma.startup.create({ data: dto });
    return {
      status: true,
      message: "Startup created successfully",
      data: startup,
      meta: {},
    };
  }

  async findAll(query: QueryStartupDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = "name",
      sortOrder = "asc",
      projectId,
      registered,
      year,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ];
    }
    if (projectId) {
      where.projectId = projectId;
    }
    if (registered !== undefined) {
      where.registered = registered;
    }
    if (year) {
      where.year = year;
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder === "desc" ? "desc" : "asc";

    const [items, total] = await this.prisma.$transaction([
      this.prisma.startup.findMany({ where, skip, take: limit, orderBy }),
      this.prisma.startup.count({ where }),
    ]);

    return {
      status: true,
      message: "Successfully retrieved items",
      data: items,
      meta: this.infrastructure.generatePaginationMeta(total, page, limit, `/startups`),
    };
  }

  async findOne(id: string) {
    await this.infrastructure.checkRecordExists("startup", id);
    const item = await this.prisma.startup.findUnique({ where: { id } });
    return {
      status: true,
      message: "Startup retrieved successfully",
      data: item,
      meta: {},
    };
  }

  async update(id: string, dto: UpdateStartupDto) {
    await this.infrastructure.checkRecordExists("startup", id);
    if (dto.projectId) {
      await this.infrastructure.checkRecordExists("project", dto.projectId);
    }
    const updated = await this.prisma.startup.update({ where: { id }, data: dto });
    return {
      status: true,
      message: "Startup updated successfully",
      data: updated,
      meta: {},
    };
  }

  async remove(id: string) {
    await this.infrastructure.checkRecordExists("startup", id);
    await this.prisma.startup.delete({ where: { id } });
    return {
      status: true,
      message: "Startup deleted successfully",
      data: null,
      meta: {},
    };
  }

  async findByProjectId(projectId: string) {
    await this.infrastructure.checkRecordExists("project", projectId);
    const startup = await this.prisma.startup.findUnique({ where: { projectId } });
    return {
      status: true,
      message: "Startup retrieved successfully",
      data: startup,
      meta: {},
    };
  }

  async findRegistered() {
    return this.findAll({ registered: true } as QueryStartupDto);
  }

  async findByYear(year: number) {
    return this.findAll({ year } as QueryStartupDto);
  }
}
