import { Injectable } from "@nestjs/common";

import { InfrastructureService } from "../infrastructure/infrastructure.service";
import { LoggerService } from "../logger/logger.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProjectSdgDto } from "./dto/create-project-sdg.dto";

@Injectable()
export class SdgService {
  constructor(
    private prisma: PrismaService,
    private readonly infrastructure: InfrastructureService,
    private readonly logger: LoggerService
  ) {}

  async getAllProjectSdgs() {
    const links = await this.prisma.projectSdg.findMany({
      include: { project: true, sdg: true },
    });
    return {
      status: true,
      message: "Project SDGs retrieved successfully",
      data: links,
      meta: {},
    };
  }

  async getProjectSdgs(projectId: string) {
    await this.infrastructure.checkRecordExists("project", projectId);
    const links = await this.prisma.projectSdg.findMany({
      where: { projectId },
      include: { sdg: true },
    });
    return {
      status: true,
      message: "SDGs retrieved successfully",
      data: links.map((l) => l.sdg),
      meta: {},
    };
  }

  async addProjectSdg(projectId: string, dto: CreateProjectSdgDto) {
    await this.infrastructure.checkRecordExists("project", projectId);
    await this.infrastructure.checkRecordExists("sdg", dto.sdgId);

    const link = await this.prisma.projectSdg.create({
      data: { projectId, sdgId: dto.sdgId },
      include: { sdg: true },
    });

    return {
      status: true,
      message: "SDG linked to project successfully",
      data: link,
      meta: {},
    };
  }

  async removeProjectSdg(projectId: string, sdgId: string) {
    await this.infrastructure.checkRecordExists("project", projectId);
    await this.infrastructure.checkRecordExists("sdg", sdgId);

    await this.prisma.projectSdg.delete({
      where: { projectId_sdgId: { projectId, sdgId } },
    });

    return {
      status: true,
      message: "SDG removed from project",
      data: null,
      meta: {},
    };
  }

  async getProjectsBySdg(sdgId: string) {
    await this.infrastructure.checkRecordExists("sdg", sdgId);
    const links = await this.prisma.projectSdg.findMany({
      where: { sdgId },
      include: { project: true },
    });
    return {
      status: true,
      message: "Projects retrieved successfully",
      data: links.map((l) => l.project),
      meta: {},
    };
  }

  async getSdgStatistics() {
    const stats = await this.prisma.projectSdg.groupBy({
      by: ["sdgId"],
      _count: { sdgId: true },
    });
    const sdgs = await this.prisma.sdg.findMany();
    const result = sdgs.map((sdg) => {
      const found = stats.find((s) => s.sdgId === sdg.id);
      return {
        sdg,
        count: found ? (found._count as any).sdgId : 0,
      };
    });
    return {
      status: true,
      message: "SDG statistics retrieved successfully",
      data: result,
      meta: {},
    };
  }

  async getSdgCoverage() {
    const totalProjects = await this.prisma.project.count();
    const projectIds = await this.prisma.projectSdg.findMany({
      distinct: ["projectId"],
      select: { projectId: true },
    });
    return {
      status: true,
      message: "SDG coverage retrieved successfully",
      data: {
        totalProjects,
        projectsWithSdgs: projectIds.length,
        coverage: totalProjects > 0 ? projectIds.length / totalProjects : 0,
      },
      meta: {},
    };
  }
}
