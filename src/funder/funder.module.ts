import { Module } from "@nestjs/common";

import { FunderController } from "./funder.controller";
import { FunderService } from "./funder.service";

@Module({
  imports: [],
  controllers: [FunderController],
  providers: [FunderService],
})
export class FunderModule {}
