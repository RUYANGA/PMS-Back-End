import { Module } from "@nestjs/common";

import { InfrastructureModule } from "../infrastructure/infrastructure.module";
import { LoggerModule } from "../logger/logger.module";
import { PrismaModule } from "../prisma/prisma.module";
import { ProjectEvaluationController } from "./project-evaluation.controller";
import { ProjectEvaluationService } from "./project-evaluation.service";

@Module({
  imports: [PrismaModule, InfrastructureModule, LoggerModule],
  controllers: [ProjectEvaluationController],
  providers: [ProjectEvaluationService],
})
export class ProjectEvaluationModule {}
