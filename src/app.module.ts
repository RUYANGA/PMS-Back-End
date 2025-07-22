import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AttachmentModule } from "./attachment/attachment.module";
import { AuthModule } from "./auth/auth.module";
import { CategoryModule } from "./category/category.module";
import { FunderModule } from "./funder/funder.module";
import { InfrastructureModule } from "./infrastructure/infrastructure.module";
import { LoggerModule } from "./logger/logger.module";
import { MailModule } from "./mail/mail.module";
import { OrganisationModule } from "./organisation/organisation.module";
import { PermissionModule } from "./permission/permission.module";
import { PositionModule } from "./position/position.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ProjectAuthorModule } from "./project-author/project-author.module";
import { ProjectEvaluationModule } from "./project-evaluation/project-evaluation.module";
import { ProjectFunderModule } from "./project-funder/project-funder.module";
import { ProjectReportModule } from "./project-report/project-report.module";
import { ProjectStakeholdersModule } from "./project-stakeholders/project-stakeholders.module";
import { ProjectsModule } from "./projects/projects.module";
import { RoleModule } from "./role/role.module";
import { SdgModule } from "./sdg/sdg.module";
import { StakeholderModule } from "./stakeholder/stakeholder.module";
import { StartupModule } from "./startup/startup.module";
import { UserPositionsModule } from "./user-positions/user-positions.module";
import { UserRolesModule } from "./user-roles/user-roles.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        throttlers: [
          {
            name: "default",
            ttl: 60000,
            limit: 100,
          },
          {
            name: "auth",
            ttl: 60000,
            limit: 20,
          },
          {
            name: "public",
            ttl: 60000,
            limit: 300,
          },
        ],
      }),
    }),
    LoggerModule,
    MailModule,
    PrismaModule,
    CategoryModule,
    FunderModule,
    OrganisationModule,
    InfrastructureModule,
    PositionModule,
    UsersModule,
    StakeholderModule,
    ProjectStakeholdersModule,
    ProjectReportModule,
    AuthModule,
    AuthModule,
    ProjectsModule,
    SdgModule,
    StartupModule,
    ProjectAuthorModule,
    ProjectFunderModule,
    ProjectEvaluationModule,
    UserPositionsModule,
    UserRolesModule,
    RoleModule,
    PermissionModule,
    AttachmentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
