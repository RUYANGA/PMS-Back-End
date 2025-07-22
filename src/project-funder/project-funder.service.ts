import { Injectable, NotFoundException } from "@nestjs/common";

import { InfrastructureService } from "../infrastructure/infrastructure.service";
import { LoggerService } from "../logger/logger.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProjectFunderDto } from "./dto/create-project-funder.dto";
import { QueryProjectFunderDto } from "./dto/query-project-funder.dto";
import { UpdateProjectFunderDto } from "./dto/update-project-funder.dto";

@Injectable()
export class ProjectFunderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly infrastructure: InfrastructureService,
    private readonly logger: LoggerService
  ) {}

  async create(createDto: CreateProjectFunderDto) {
    this.logger.log(
      `Creating project funder: ${JSON.stringify(createDto)}`,
      "ProjectFunderService"
    );

    await this.infrastructure.checkRecordExists("project", createDto.projectId);
    await this.infrastructure.checkRecordExists("funder", createDto.funderId);

    const record = await this.prisma.projectFunder.create({
      data: {
        project: { connect: { id: createDto.projectId } },
        funder: { connect: { id: createDto.funderId } },
        amount: createDto.amount,
      },
    });

    this.logger.log(`Successfully created project funder`, "ProjectFunderService");
    return {
      status: true,
      message: "Project funder created successfully",
      data: record,
      meta: {},
    };
  }

  async findAll(query: QueryProjectFunderDto) {
    const {
      page = 1,
      limit = 10,
      projectId,
      funderId,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (funderId) where.funderId = funderId;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.projectFunder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.projectFunder.count({ where }),
    ]);

    return {
      status: true,
      message: "Successfully retrieved project funders",
      data: items,
      meta: this.infrastructure.generatePaginationMeta(total, page, limit, "/project-funder"),
    };
  }

  async findOne(projectId: string, funderId: string) {
    const record = await this.prisma.projectFunder.findUnique({
      where: { projectId_funderId: { projectId, funderId } },
    });
    if (!record) {
      throw new NotFoundException("Project funder not found");
    }
    return {
      status: true,
      message: "Project funder retrieved successfully",
      data: record,
      meta: {},
    };
  }

  async update(projectId: string, funderId: string, dto: UpdateProjectFunderDto) {
    await this.findOne(projectId, funderId);
    const updated = await this.prisma.projectFunder.update({
      where: { projectId_funderId: { projectId, funderId } },
      data: dto,
    });
    return {
      status: true,
      message: "Project funder updated successfully",
      data: updated,
      meta: {},
    };
  }

  async remove(projectId: string, funderId: string) {
    await this.findOne(projectId, funderId);
    await this.prisma.projectFunder.delete({
      where: { projectId_funderId: { projectId, funderId } },
    });
    return {
      status: true,
      message: "Project funder deleted successfully",
      data: null,
      meta: {},
    };
  }
}
