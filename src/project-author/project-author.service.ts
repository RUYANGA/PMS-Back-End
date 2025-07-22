import { Injectable } from "@nestjs/common";

import { InfrastructureService } from "../infrastructure/infrastructure.service";
import { LoggerService } from "../logger/logger.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProjectAuthorDto } from "./dto/create-project-author.dto";
import { UpdateProjectAuthorDto } from "./dto/update-project-author.dto";

@Injectable()
export class ProjectAuthorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly infrastructure: InfrastructureService,
    private readonly logger: LoggerService
  ) {}
  async create(createProjectAuthorDto: CreateProjectAuthorDto) {
    this.logger.log(
      `Creating project author: ${JSON.stringify(createProjectAuthorDto)}`,
      "ProjectAuthorService"
    );
    await this.infrastructure.checkRecordExists("project", createProjectAuthorDto.projectId);
    await this.infrastructure.checkRecordExists("user", createProjectAuthorDto.userId);

    const projectAuthor = await this.prisma.projectAuthor.create({
      data: {
        role: createProjectAuthorDto.role,
        user: {
          connect: {
            id: createProjectAuthorDto.userId,
          },
        },
        project: {
          connect: {
            id: createProjectAuthorDto.projectId,
          },
        },
      },
      select: {
        id: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true,
            phone: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
            titleNorm: true,
            abstract: true,
            projectType: true,
            year: true,
            status: true,
            submittedAt: true,
            innovationField: true,
            expectedIp: true,
            progressPercent: true,
          },
        },
      },
    });

    this.logger.log(
      `Successfully created project author with ID: ${projectAuthor.id}`,
      "ProjectAuthorService"
    );
    return {
      status: true,
      message: "Project author created successfully!",
      data: projectAuthor,
      meta: {},
    };
  }

  async findAll() {
    this.logger.log("Retrieving all project authors", "ProjectAuthorService");
    const projectAuthors = await this.prisma.projectAuthor.findMany();
    this.logger.log(`Found ${projectAuthors.length} project authors`, "ProjectAuthorService");
    return {
      status: true,
      message: "Successfully retrieved project authors",
      data: projectAuthors,
      meta: {},
    };
  }

  async findOne(id: string) {
    this.logger.log(`Retrieving project author with ID: ${id}`, "ProjectAuthorService");
    const projectAuthor = await this.infrastructure.checkRecordExists("projectAuthor", id);

    this.logger.log(`Successfully retrieved project author with ID: ${id}`, "ProjectAuthorService");
    return {
      status: true,
      message: "Project author retrieved successfully!",
      data: projectAuthor,
      meta: {},
    };
  }

  async update(id: string, updateProjectAuthorDto: UpdateProjectAuthorDto) {
    this.logger.log(
      `Updating project author ${id} with data: ${JSON.stringify(updateProjectAuthorDto)}`,
      "ProjectAuthorService"
    );
    await this.infrastructure.checkRecordExists("projectAuthor", id);

    if (updateProjectAuthorDto.projectId) {
      await this.infrastructure.checkRecordExists("project", updateProjectAuthorDto.projectId);
    }
    if (updateProjectAuthorDto.userId) {
      await this.infrastructure.checkRecordExists("user", updateProjectAuthorDto.userId);
    }

    const updatedProjectAuthor = await this.prisma.projectAuthor.update({
      where: { id },
      data: updateProjectAuthorDto,
    });

    this.logger.log(`Successfully updated project author ${id}`, "ProjectAuthorService");
    return {
      status: true,
      message: "Project author updated successfully!",
      data: updatedProjectAuthor,
      meta: {},
    };
  }

  async remove(id: string) {
    this.logger.log(`Attempting to delete project author: ${id}`, "ProjectAuthorService");
    await this.infrastructure.checkRecordExists("projectAuthor", id);

    await this.prisma.projectAuthor.delete({
      where: { id },
    });

    this.logger.log(`Successfully deleted project author: ${id}`, "ProjectAuthorService");
    return {
      status: true,
      message: "Project author deleted successfully!",
      data: null,
      meta: {},
    };
  }
}
