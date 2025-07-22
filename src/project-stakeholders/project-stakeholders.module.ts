import { Module } from "@nestjs/common";

import { ProjectStakeholdersController } from "./project-stakeholders.controller";
import { ProjectStakeholdersService } from "./project-stakeholders.service";

@Module({
  controllers: [ProjectStakeholdersController],
  providers: [ProjectStakeholdersService],
})
export class ProjectStakeholdersModule {}
