import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import { UuidValidationPipe } from "../shared/pipes/uuid-validation.pipe";
import { CreateProjectEvaluationDto } from "./dto/create-project-evaluation.dto";
import { QueryProjectEvaluationDto } from "./dto/query-project-evaluation.dto";
import { UpdateProjectEvaluationDto } from "./dto/update-project-evaluation.dto";
import { ProjectEvaluationService } from "./project-evaluation.service";

@ApiTags("Project Evaluations")
@Controller()
export class ProjectEvaluationController {
  constructor(private readonly service: ProjectEvaluationService) {}

  // CRUD
  @Get("project-evaluations")
  findAll(@Query() query: QueryProjectEvaluationDto) {
    return this.service.findAll(query);
  }

  @Get("project-evaluations/:id")
  findOne(@Param("id", UuidValidationPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post("project-evaluations")
  @ApiBody({ type: CreateProjectEvaluationDto })
  create(@Body() dto: CreateProjectEvaluationDto) {
    return this.service.create(dto);
  }

  @Put("project-evaluations/:id")
  @ApiBody({ type: UpdateProjectEvaluationDto })
  update(@Param("id", UuidValidationPipe) id: string, @Body() dto: UpdateProjectEvaluationDto) {
    return this.service.update(id, dto);
  }

  @Delete("project-evaluations/:id")
  remove(@Param("id", UuidValidationPipe) id: string) {
    return this.service.remove(id);
  }

  // Project-specific
  @Get("projects/:id/evaluations")
  findByProject(@Param("id", UuidValidationPipe) id: string) {
    return this.service.findByProject(id);
  }

  @Post("projects/:id/evaluations")
  @ApiBody({ type: CreateProjectEvaluationDto })
  createForProject(
    @Param("id", UuidValidationPipe) id: string,
    @Body() dto: CreateProjectEvaluationDto
  ) {
    return this.service.createForProject(id, dto);
  }

  @Get("projects/:id/evaluations/summary")
  projectSummary(@Param("id", UuidValidationPipe) id: string) {
    return this.service.summary(id);
  }

  // Evaluator queries
  @Get("evaluators/:userId/evaluations")
  findByEvaluator(@Param("userId", UuidValidationPipe) userId: string) {
    return this.service.findByEvaluator(userId);
  }

  @Get("evaluations/pending")
  pending() {
    return this.service.findPending();
  }
}
