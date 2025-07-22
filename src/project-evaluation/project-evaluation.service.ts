import { Injectable } from "@nestjs/common";

import { InfrastructureService } from "../infrastructure/infrastructure.service";
import { LoggerService } from "../logger/logger.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProjectEvaluationDto, EvaluationStatus } from "./dto/create-project-evaluation.dto";
import { QueryProjectEvaluationDto } from "./dto/query-project-evaluation.dto";
import { UpdateProjectEvaluationDto } from "./dto/update-project-evaluation.dto";

@Injectable()
export class ProjectEvaluationService {
  constructor(
    private prisma: PrismaService,
    private readonly infrastructure: InfrastructureService,
    private readonly logger: LoggerService
  ) {}

  async create(dto: CreateProjectEvaluationDto) {
    this.logger.log(`Creating evaluation: ${JSON.stringify(dto)}`, "ProjectEvaluationService");
    await this.infrastructure.checkRecordExists("project", dto.projectId);
    await this.infrastructure.checkRecordExists("user", dto.evaluatorId);

    const evaluation = await this.prisma.projectEvaluation.create({ data: dto });

    this.logger.log(`Created evaluation ${evaluation.id}`, "ProjectEvaluationService");
    return {
      status: true,
      message: "Evaluation created successfully",
      data: evaluation,
      meta: {},
    };
  }

  async findAll(query: QueryProjectEvaluationDto) {
    const { page = 1, limit = 10, projectId, evaluatorId, status } = query;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (evaluatorId) where.evaluatorId = evaluatorId;
    if (status) where.status = status;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.projectEvaluation.findMany({ where, skip, take: limit }),
      this.prisma.projectEvaluation.count({ where }),
    ]);

    return {
      status: true,
      message: "Successfully retrieved evaluations",
      data,
      meta: this.infrastructure.generatePaginationMeta(total, page, limit, `/project-evaluations`),
    };
  }

  async findOne(id: string) {
    const evaluation = await this.infrastructure.checkRecordExists("projectEvaluation", id);
    return { status: true, message: "Evaluation retrieved", data: evaluation, meta: {} };
  }

  async update(id: string, dto: UpdateProjectEvaluationDto) {
    await this.infrastructure.checkRecordExists("projectEvaluation", id);
    if (dto.projectId) await this.infrastructure.checkRecordExists("project", dto.projectId);
    if (dto.evaluatorId) await this.infrastructure.checkRecordExists("user", dto.evaluatorId);
    const evaluation = await this.prisma.projectEvaluation.update({ where: { id }, data: dto });
    return { status: true, message: "Evaluation updated", data: evaluation, meta: {} };
  }

  async remove(id: string) {
    await this.infrastructure.checkRecordExists("projectEvaluation", id);
    await this.prisma.projectEvaluation.delete({ where: { id } });
    return { status: true, message: "Evaluation deleted", data: null, meta: {} };
  }

  async findByProject(projectId: string) {
    await this.infrastructure.checkRecordExists("project", projectId);
    const evaluations = await this.prisma.projectEvaluation.findMany({ where: { projectId } });
    return { status: true, message: "Project evaluations retrieved", data: evaluations, meta: {} };
  }

  async createForProject(projectId: string, dto: CreateProjectEvaluationDto) {
    return this.create({ ...dto, projectId });
  }

  async summary(projectId: string) {
    await this.infrastructure.checkRecordExists("project", projectId);
    const avg = await this.prisma.projectEvaluation.aggregate({
      where: { projectId },
      _avg: { score: true },
      _count: { score: true },
    });
    const pending = await this.prisma.projectEvaluation.count({
      where: { projectId, status: EvaluationStatus.PENDING },
    });
    return {
      status: true,
      message: "Evaluation summary retrieved",
      data: { averageScore: avg._avg.score, total: avg._count.score, pending },
      meta: {},
    };
  }

  async findByEvaluator(userId: string) {
    await this.infrastructure.checkRecordExists("user", userId);
    const evaluations = await this.prisma.projectEvaluation.findMany({
      where: { evaluatorId: userId },
    });
    return {
      status: true,
      message: "Evaluator evaluations retrieved",
      data: evaluations,
      meta: {},
    };
  }

  async findPending() {
    const evaluations = await this.prisma.projectEvaluation.findMany({
      where: { status: EvaluationStatus.PENDING },
    });
    return { status: true, message: "Pending evaluations retrieved", data: evaluations, meta: {} };
  }
}
