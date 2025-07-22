import { Module } from "@nestjs/common";

import { InfrastructureModule } from "../infrastructure/infrastructure.module";
import { LoggerModule } from "../logger/logger.module";
import { PrismaModule } from "../prisma/prisma.module";
import { StartupController } from "./startup.controller";
import { StartupService } from "./startup.service";

@Module({
  imports: [PrismaModule, LoggerModule, InfrastructureModule],
  controllers: [StartupController],
  providers: [StartupService],
  exports: [StartupService],
})
export class StartupModule {}
