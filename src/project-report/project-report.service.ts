import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";

import { InfrastructureService } from "../infrastructure/infrastructure.service";
import { LoggerService } from "../logger/logger.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProjectReportDto } from "./dto/create-project-report.dto";
import { CreateProjectReportWithoutProjectIdDto } from "./dto/create-project-report-without-project-id.dto";
import { QueryProjectReportDto } from "./dto/query-project-report.dto";
import { UpdateProjectReportDto } from "./dto/update-project-report.dto";

@Injectable()
export class ProjectReportService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly infrastructure: InfrastructureService
  ) {}

  /**
   * Creates a new project report.
   * @param createProjectReportDto The data for creating the report.
   * @returns The newly created project report.
   */
  async create(createProjectReportDto: CreateProjectReportDto) {
    this.logger.log(
      `Creating project report: ${JSON.stringify(createProjectReportDto)}`,
      "ProjectReportService"
    );

    await this.infrastructure.checkRecordExists("project", createProjectReportDto.projectId);
    await this.infrastructure.checkRecordExists("user", createProjectReportDto.submittedById);

    const result = await this.prisma.projectReport.create({
      data: {
        title: createProjectReportDto.title,
        reportingPeriod: createProjectReportDto.reportingPeriod,
        content: createProjectReportDto.content,
        fundUsage: createProjectReportDto.fundUsage,
        projectId: createProjectReportDto.projectId,
        submittedById: createProjectReportDto.submittedById,
      },
    });

    this.logger.log(
      `Successfully created project report with ID: ${result.id}`,
      "ProjectReportService"
    );
    return {
      status: true,
      message: "Project report created successfully",
      data: result,
      meta: {},
    };
  }

  /**
   * Retrieves all project reports with pagination and optional filtering.
   * @param query The query parameters for pagination and filtering.
   * @returns A list of project reports and the total count.
   */
  async findAll(query: QueryProjectReportDto) {
    this.logger.log(
      `Retrieving project reports with query: ${JSON.stringify(query)}`,
      "ProjectReportService"
    );
    const {
      page = 1,
      limit = 10,
      search,
      projectId,
      reportingPeriod,
      sortBy = "submittedAt",
      sortOrder = "desc",
    } = query;
    const skip = (page - 1) * limit;

    let where: any = {};

    if (search) {
      this.logger.debug(`Applying search filter: ${search}`, "ProjectReportService");
      where = {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { content: { contains: search, mode: "insensitive" as const } },
          { reportingPeriod: { contains: search, mode: "insensitive" as const } },
        ],
      };
    }

    if (projectId) {
      where.projectId = projectId;
    }

    if (reportingPeriod) {
      where.reportingPeriod = reportingPeriod;
    }

    const orderBy: any = {};
    if (sortBy && ["title", "submittedAt", "reportingPeriod"].includes(sortBy)) {
      orderBy[sortBy] = sortOrder === "desc" ? "desc" : "asc";
    } else {
      orderBy.submittedAt = "desc";
    }

    this.logger.debug(
      `Executing query with pagination: page=${page}, limit=${limit}, sortBy=${sortBy}, sortOrder=${sortOrder}`,
      "ProjectReportService"
    );

    const [reports, total] = await this.prisma.$transaction([
      this.prisma.projectReport.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.projectReport.count({ where }),
    ]);

    this.logger.log(
      `Found ${total} project reports, returning page ${page} with ${reports.length} results`,
      "ProjectReportService"
    );

    const totalPages = Math.ceil(total / limit);

    return {
      status: true,
      message: "Successfully retrieved project reports",
      data: reports,
      meta: {
        pagination: {
          total,
          count: reports.length,
          perPage: limit,
          currentPage: page,
          totalPages,
          links: {
            first: `/project-reports?page=1&limit=${limit}`,
            last: `/project-reports?page=${totalPages}&limit=${limit}`,
            prev: page > 1 ? `/project-reports?page=${page - 1}&limit=${limit}` : null,
            next: page < totalPages ? `/project-reports?page=${page + 1}&limit=${limit}` : null,
          },
        },
      },
    };
  }

  /**
   * Retrieves all reports for a specific project.
   * @param projectId The ID of the project.
   * @returns A list of project reports for the specified project.
   */
  async findByProject(projectId: string, query?: QueryProjectReportDto) {
    this.logger.log(`Retrieving reports for project: ${projectId}`, "ProjectReportService");

    await this.infrastructure.checkRecordExists("project", projectId);

    const {
      page = 1,
      limit = 10,
      search,
      reportingPeriod,
      sortBy = "submittedAt",
      sortOrder = "desc",
    } = query || {};
    const skip = (page - 1) * limit;

    let where: any = { projectId };

    if (search) {
      where = {
        AND: [
          { projectId },
          {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              { content: { contains: search, mode: "insensitive" as const } },
              { reportingPeriod: { contains: search, mode: "insensitive" as const } },
            ],
          },
        ],
      };
    }

    if (reportingPeriod) {
      where.reportingPeriod = reportingPeriod;
    }

    const orderBy: any = {};
    if (["title", "submittedAt", "reportingPeriod"].includes(sortBy)) {
      orderBy[sortBy] = sortOrder === "desc" ? "desc" : "asc";
    } else {
      orderBy.submittedAt = "desc";
    }

    const [reports, total] = await this.prisma.$transaction([
      this.prisma.projectReport.findMany({ where, skip, take: limit, orderBy }),
      this.prisma.projectReport.count({ where }),
    ]);

    this.logger.log(`Found ${total} reports for project ${projectId}`, "ProjectReportService");

    return {
      status: true,
      message: "Project reports retrieved successfully",
      data: reports,
      meta: this.infrastructure.generatePaginationMeta(
        total,
        page,
        limit,
        `/projects/${projectId}/reports`
      ),
    };
  }

  async findLatest(projectId: string) {
    this.logger.log(`Retrieving latest report for project: ${projectId}`, "ProjectReportService");

    await this.infrastructure.checkRecordExists("project", projectId);

    const report = await this.prisma.projectReport.findFirst({
      where: { projectId },
      orderBy: { submittedAt: "desc" },
    });

    if (!report) {
      throw new NotFoundException("No reports found for this project");
    }

    return {
      status: true,
      message: "Latest project report retrieved successfully",
      data: report,
      meta: {},
    };
  }

  async summary(projectId: string) {
    this.logger.log(`Retrieving summary for project: ${projectId}`, "ProjectReportService");

    await this.infrastructure.checkRecordExists("project", projectId);

    const [count, usage] = await this.prisma.$transaction([
      this.prisma.projectReport.count({ where: { projectId } }),
      this.prisma.projectReport.aggregate({
        where: { projectId },
        _sum: { fundUsage: true },
      }),
    ]);

    return {
      status: true,
      message: "Project report summary retrieved successfully",
      data: {
        totalReports: count,
        totalFundUsage: usage._sum.fundUsage ?? 0,
      },
      meta: {},
    };
  }

  async findBySubmitter(userId: string, query?: QueryProjectReportDto) {
    this.logger.log(`Retrieving reports submitted by user: ${userId}`, "ProjectReportService");

    await this.infrastructure.checkRecordExists("user", userId);

    const { page = 1, limit = 10, sortBy = "submittedAt", sortOrder = "desc" } = query || {};
    const skip = (page - 1) * limit;

    const orderBy: any = {};
    if (["title", "submittedAt", "reportingPeriod"].includes(sortBy)) {
      orderBy[sortBy] = sortOrder === "desc" ? "desc" : "asc";
    } else {
      orderBy.submittedAt = "desc";
    }

    const [reports, total] = await this.prisma.$transaction([
      this.prisma.projectReport.findMany({
        where: { submittedById: userId },
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.projectReport.count({ where: { submittedById: userId } }),
    ]);

    return {
      status: true,
      message: "Project reports retrieved successfully",
      data: reports,
      meta: this.infrastructure.generatePaginationMeta(
        total,
        page,
        limit,
        `/reports/by-submitter/${userId}`
      ),
    };
  }

  async findByPeriod(period: string, query?: QueryProjectReportDto) {
    this.logger.log(`Retrieving reports for period: ${period}`, "ProjectReportService");

    const { page = 1, limit = 10, sortBy = "submittedAt", sortOrder = "desc" } = query || {};
    const skip = (page - 1) * limit;

    const orderBy: any = {};
    if (["title", "submittedAt", "reportingPeriod"].includes(sortBy)) {
      orderBy[sortBy] = sortOrder === "desc" ? "desc" : "asc";
    } else {
      orderBy.submittedAt = "desc";
    }

    const [reports, total] = await this.prisma.$transaction([
      this.prisma.projectReport.findMany({
        where: { reportingPeriod: period },
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.projectReport.count({ where: { reportingPeriod: period } }),
    ]);

    return {
      status: true,
      message: "Project reports retrieved successfully",
      data: reports,
      meta: this.infrastructure.generatePaginationMeta(
        total,
        page,
        limit,
        `/reports/by-period/${period}`
      ),
    };
  }

  async findPending(query?: QueryProjectReportDto) {
    this.logger.log("Retrieving pending project reports", "ProjectReportService");

    const { page = 1, limit = 10 } = query || {};
    const skip = (page - 1) * limit;

    const where = { project: { status: "PENDING" as const } };

    const [reports, total] = await this.prisma.$transaction([
      this.prisma.projectReport.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submittedAt: "desc" },
      }),
      this.prisma.projectReport.count({ where }),
    ]);

    return {
      status: true,
      message: "Project reports retrieved successfully",
      data: reports,
      meta: this.infrastructure.generatePaginationMeta(total, page, limit, "/reports/pending"),
    };
  }

  /**
   * Retrieves all reports for a specific project.
   * @param projectId The ID of the project.
   * @returns A list of project reports for the specified project.
   */
  async findOne(id: string) {
    this.logger.log(`Retrieving project report with ID: ${id}`, "ProjectReportService");

    const report = await this.infrastructure.checkRecordExists("projectReport", id);

    this.logger.log(`Successfully retrieved project report with ID: ${id}`, "ProjectReportService");
    return {
      status: true,
      message: "Project report retrieved successfully",
      data: report,
      meta: {},
    };
  }

  /**
   * Updates an existing project report.
   * @param id The ID of the project report to update.
   * @param updateProjectReportDto The data for updating the report.
   * @returns The updated project report.
   */
  async update(id: string, updateProjectReportDto: UpdateProjectReportDto) {
    this.logger.log(
      `Updating project report ${id} with data: ${JSON.stringify(updateProjectReportDto)}`,
      "ProjectReportService"
    );
    await this.infrastructure.checkRecordExists("projectReport", id);

    if (updateProjectReportDto.projectId) {
      await this.infrastructure.checkRecordExists("project", updateProjectReportDto.projectId);
    }

    if (updateProjectReportDto.submittedById) {
      await this.infrastructure.checkRecordExists("user", updateProjectReportDto.submittedById);
    }

    const result = await this.prisma.projectReport.update({
      where: { id },
      data: updateProjectReportDto,
    });

    this.logger.log(`Successfully updated project report ${id}`, "ProjectReportService");
    return {
      status: true,
      message: "Project report updated successfully",
      data: result,
      meta: {},
    };
  }

  /**
   * Deletes a project report by its ID.
   * @param id The ID of the project report to delete.
   * @returns The deleted project report.
   */
  async remove(id: string) {
    this.logger.log(`Attempting to delete project report: ${id}`, "ProjectReportService");
    await this.infrastructure.checkRecordExists("projectReport", id);

    const result = await this.prisma.projectReport.delete({
      where: { id },
    });

    this.logger.log(`Successfully deleted project report: ${id}`, "ProjectReportService");
    return {
      status: true,
      message: "Project report deleted successfully",
      data: result,
      meta: {},
    };
  }
}
