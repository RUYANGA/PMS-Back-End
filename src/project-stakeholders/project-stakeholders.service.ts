import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";

import { InfrastructureService } from "../infrastructure/infrastructure.service";
import { LoggerService } from "../logger/logger.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProjectStakeholderDto, StakeholderRole } from "./dto/create-project-stakeholder.dto";
import { UpdateProjectStakeholderDto } from "./dto/update-project-stakeholder.dto";

@Injectable()
export class ProjectStakeholdersService {
  constructor(
    private prisma: PrismaService,
    private readonly infrastructure: InfrastructureService,
    private readonly logger: LoggerService
  ) {}

  async findAll() {
    this.logger.log("Retrieving all project stakeholders", "ProjectStakeholdersService");
    const records = await this.prisma.projectStakeholder.findMany({
      include: { project: true, stakeholder: true },
    });
    return {
      status: true,
      message: "Successfully retrieved project stakeholders",
      data: records,
      meta: {},
    };
  }

  async findByProject(projectId: string) {
    await this.infrastructure.checkRecordExists("project", projectId);
    const records = await this.prisma.projectStakeholder.findMany({
      where: { projectId },
      include: { stakeholder: true },
    });
    return {
      status: true,
      message: "Project stakeholders retrieved successfully",
      data: records.map((r) => r.stakeholder),
      meta: {},
    };
  }

  async create(projectId: string, dto: CreateProjectStakeholderDto) {
    await this.infrastructure.checkRecordExists("project", projectId);
    await this.infrastructure.checkRecordExists("stakeholder", dto.stakeholderId);

    const existing = await this.prisma.projectStakeholder.findUnique({
      where: { projectId_stakeholderId: { projectId, stakeholderId: dto.stakeholderId } },
    });
    if (existing) {
      throw new ConflictException("Stakeholder already assigned to this project.");
    }

    const record = await this.prisma.projectStakeholder.create({
      data: {
        projectId,
        stakeholderId: dto.stakeholderId,
        role: dto.role ?? StakeholderRole.BENEFICIARY,
      },
      include: {
        stakeholder: true,
        project: true,
      },
    });
    return {
      status: true,
      message: "Project stakeholder created successfully",
      data: record,
      meta: {},
    };
  }

  async update(projectId: string, stakeholderId: string, dto: UpdateProjectStakeholderDto) {
    await this.infrastructure.checkRecordExists("project", projectId);
    await this.infrastructure.checkRecordExists("stakeholder", stakeholderId);

    const existing = await this.prisma.projectStakeholder.findUnique({
      where: { projectId_stakeholderId: { projectId, stakeholderId } },
    });
    if (!existing) {
      throw new NotFoundException("Project stakeholder not found.");
    }

    const result = await this.prisma.projectStakeholder.update({
      where: { projectId_stakeholderId: { projectId, stakeholderId } },
      data: {
        role: dto.role ?? existing.role,
      },
      include: { stakeholder: true, project: true },
    });
    return {
      status: true,
      message: "Project stakeholder updated successfully",
      data: result,
      meta: {},
    };
  }

  async remove(projectId: string, stakeholderId: string) {
    await this.infrastructure.checkRecordExists("project", projectId);
    await this.infrastructure.checkRecordExists("stakeholder", stakeholderId);

    const existing = await this.prisma.projectStakeholder.findUnique({
      where: { projectId_stakeholderId: { projectId, stakeholderId } },
    });
    if (!existing) {
      throw new NotFoundException("Project stakeholder not found.");
    }

    await this.prisma.projectStakeholder.delete({
      where: { projectId_stakeholderId: { projectId, stakeholderId } },
    });
    return {
      status: true,
      message: "Project stakeholder deleted successfully",
      data: null,
      meta: {},
    };
  }
}
