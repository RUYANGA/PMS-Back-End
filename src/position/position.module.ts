import { Module } from "@nestjs/common";

import { UuidValidationPipe } from "../shared/pipes/uuid-validation.pipe";
import { PositionController } from "./position.controller";
import { PositionService } from "./position.service";

@Module({
  controllers: [PositionController],
  providers: [PositionService, UuidValidationPipe],
})
export class PositionModule {}
