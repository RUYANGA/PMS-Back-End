import { Module } from "@nestjs/common";

import { ProjectFunderController } from "./project-funder.controller";
import { ProjectFunderService } from "./project-funder.service";

@Module({
  controllers: [ProjectFunderController],
  providers: [ProjectFunderService],
})
export class ProjectFunderModule {}
