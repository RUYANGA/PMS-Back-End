import { Injectable } from "@nestjs/common";

import { InfrastructureService } from "../infrastructure/infrastructure.service";
import { LoggerService } from "../logger/logger.service";
import { PrismaService } from "../prisma/prisma.service";
import { createProjectDto } from "./dto/create-project.dto";
import { QueryProject } from "./dto/query-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private readonly infrastructure: InfrastructureService,
    private readonly logger: LoggerService
  ) {}

  async create(createProjectDto: createProjectDto) {
    this.logger.log(`Creating project: ${JSON.stringify(createProjectDto)}`, "ProjectsService");
    await this.infrastructure.checkRecordExists(
      "OrganisationUnit",
      createProjectDto.organisationUnitId
    );

    const project = await this.prisma.project.create({
      data: {
        title: createProjectDto.title,
        titleNorm: createProjectDto.titleNorm,
        abstract: createProjectDto.abstract,
        projectType: createProjectDto.projectType,
        year: createProjectDto.year,
        status: createProjectDto.status,
        submittedAt: createProjectDto.submittedAt,
        expectedIp: createProjectDto.expectedIp,
        progressPercent: createProjectDto.progressPercent,
        organisationUnit: {
          connect: {
            id: createProjectDto.organisationUnitId,
          },
        },
      },
    });

    this.logger.log(`Successfully created project with ID: ${project.id}`, "ProjectsService");
    return {
      status: true,
      message: "Project created successfully!",
      data: project,
      meta: {},
    };
  }

  async findAll(queryProject: QueryProject, baseUrl = "/projects") {
    this.logger.log(
      `Retrieving projects with query: ${JSON.stringify(queryProject)}`,
      "ProjectsService"
    );
    const skip = (queryProject.page - 1) * queryProject.limit;
    const search = queryProject.search?.trim();

    const validProjectStatus = [
      "PENDING",
      "UNDER_REVIEW",
      "APPROVED",
      "REJECTED",
      "FUNDED",
      "COMPLETED",
      "ARCHIVED",
    ];

    const searchFilters: any[] = [];

    if (search) {
      searchFilters.push(
        { title: { contains: search, mode: "insensitive" as const } },
        { titleNorm: { contains: search, mode: "insensitive" as const } },
        { abstract: { contains: search, mode: "insensitive" as const } }
      );

      if (validProjectStatus.includes(search.toUpperCase())) {
        searchFilters.push({ status: search.toUpperCase() });
      }

      if (!isNaN(Number(search))) {
        searchFilters.push({ year: Number(search) });
      }

      searchFilters.push({
        innovationField: { contains: search, mode: "insensitive" as const },
      });
    }

    const where: any = {};
    if (searchFilters.length > 0) {
      where.OR = searchFilters;
    }

    if (queryProject.organisationUnitId) {
      where.organisationUnitId = queryProject.organisationUnitId;
    }

    if (queryProject.status) {
      where.status = queryProject.status;
    }

    if (queryProject.year) {
      where.year = queryProject.year;
    }

    if (queryProject.projectType) {
      where.projectType = {
        contains: queryProject.projectType,
        mode: "insensitive" as const,
      };
    }

    if (queryProject.authorId) {
      where.projectAuthors = { some: { userId: queryProject.authorId } };
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

    if (queryProject.sortBy && sortableFields.includes(queryProject.sortBy)) {
      orderBy[queryProject.sortBy] = queryProject.sortOrder === "desc" ? "desc" : "asc";
    } else {
      orderBy.title = "asc";
    }

    const [projects, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where,
        skip,
        take: queryProject.limit,
        orderBy,
        select: {
          id: true,
          title: true,
          titleNorm: true,
          abstract: true,
          projectType: true,
          year: true,
          status: true,
          innovationField: true,
          expectedIp: true,
          projectAuthors: true,
          organisationUnit: true,
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    this.logger.log(
      `Found ${total} projects, returning page ${queryProject.page} with ${projects.length} results`,
      "ProjectsService"
    );
    return {
      status: true,
      message: "Successfully retrieved projects",
      data: projects,
      meta: this.infrastructure.generatePaginationMeta(
        total,
        queryProject.page,
        queryProject.limit,
        baseUrl
      ),
    };
  }

  async findOne(id: string) {
    this.logger.log(`Retrieving project with ID: ${id}`, "ProjectsService");
    const project = await this.infrastructure.checkRecordExists("project", id);

    this.logger.log(`Successfully retrieved project with ID: ${id}`, "ProjectsService");
    return {
      status: true,
      message: "Successfully retrieved project",
      data: project,
      meta: {},
    };
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    this.logger.log(
      `Updating project ${id} with data: ${JSON.stringify(updateProjectDto)}`,
      "ProjectsService"
    );
    await this.infrastructure.checkRecordExists("project", id);

    if (updateProjectDto.organisationUnitId) {
      await this.infrastructure.checkRecordExists(
        "OrganisationUnit",
        updateProjectDto.organisationUnitId
      );
    }

    const { organisationUnitId, ...restOfUpdateProjectDto } = updateProjectDto;

    const updatedProject = await this.prisma.project.update({
      where: { id },
      data: {
        ...restOfUpdateProjectDto,
        ...(organisationUnitId && {
          organisationUnit: {
            connect: { id: organisationUnitId },
          },
        }),
      },
    });

    this.logger.log(`Successfully updated project ${id}`, "ProjectsService");
    return {
      status: true,
      message: "Project updated successfully!",
      data: updatedProject,
      meta: {},
    };
  }

  async remove(id: string) {
    this.logger.log(`Attempting to delete project: ${id}`, "ProjectsService");
    await this.infrastructure.checkRecordExists("project", id);

    await this.prisma.project.delete({
      where: {
        id: id,
      },
    });

    this.logger.log(`Successfully deleted project: ${id}`, "ProjectsService");
    return {
      status: true,
      message: "Project deleted successfully!",
      data: null,
      meta: {},
    };
  }
}
