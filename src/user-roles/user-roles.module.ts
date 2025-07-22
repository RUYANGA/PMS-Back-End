import { Module } from "@nestjs/common";

import { UserRolesController } from "./user-roles.controller";
import { UserRolesService } from "./user-roles.service";

@Module({
  imports: [],
  controllers: [UserRolesController],
  providers: [UserRolesService],
  exports: [UserRolesService],
})
export class UserRolesModule {}
