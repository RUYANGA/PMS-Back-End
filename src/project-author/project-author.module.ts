import { Module } from "@nestjs/common";

import { ProjectAuthorController } from "./project-author.controller";
import { ProjectAuthorService } from "./project-author.service";

@Module({
  controllers: [ProjectAuthorController],
  providers: [ProjectAuthorService],
})
export class ProjectAuthorModule {}
