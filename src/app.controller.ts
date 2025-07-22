import { Controller, Get, Version, VERSION_NEUTRAL } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";

import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: "Default root endpoint" })
  @Version(VERSION_NEUTRAL)
  @Get()
  getRoot(): string {
    return this.appService.getHello();
  }

  @ApiOperation({ summary: "Api Health check" })
  @Version(VERSION_NEUTRAL)
  @Get("health")
  getHealth() {
    return {
      ...this.appService.getHealth(),
      uptime: process.uptime(),
    };
  }
}
