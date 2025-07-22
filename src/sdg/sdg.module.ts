import { Module } from "@nestjs/common";

import { SdgController } from "./sdg.controller";
import { SdgService } from "./sdg.service";

@Module({
  controllers: [SdgController],
  providers: [SdgService],
})
export class SdgModule {}
