import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import { UuidValidationPipe } from "../shared/pipes/uuid-validation.pipe";
import { CreateProjectSdgDto } from "./dto/create-project-sdg.dto";
import { SdgService } from "./sdg.service";

@ApiTags("SDGs")
@Controller()
export class SdgController {
  constructor(private readonly sdgService: SdgService) {}

  @Get("/project-sdgs")
  @ApiOperation({ summary: "Get all project SDG links" })
  getAllProjectSdgs() {
    return this.sdgService.getAllProjectSdgs();
  }

  @Get("/projects/:id/sdgs")
  @ApiOperation({ summary: "Get SDGs linked to a project" })
  @ApiParam({ name: "id", description: "Project ID" })
  getProjectSdgs(@Param("id", UuidValidationPipe) id: string) {
    return this.sdgService.getProjectSdgs(id);
  }

  @Post("/projects/:id/sdgs")
  @ApiOperation({ summary: "Link an SDG to a project" })
  @ApiParam({ name: "id", description: "Project ID" })
  @ApiBody({ type: CreateProjectSdgDto })
  addProjectSdg(@Param("id", UuidValidationPipe) id: string, @Body() dto: CreateProjectSdgDto) {
    return this.sdgService.addProjectSdg(id, dto);
  }

  @Delete("/projects/:id/sdgs/:sdg")
  @ApiOperation({ summary: "Remove an SDG from a project" })
  @ApiParam({ name: "id", description: "Project ID" })
  @ApiParam({ name: "sdg", description: "SDG ID" })
  removeProjectSdg(
    @Param("id", UuidValidationPipe) id: string,
    @Param("sdg", UuidValidationPipe) sdg: string
  ) {
    return this.sdgService.removeProjectSdg(id, sdg);
  }

  @Get("/sdgs/projects/:sdg")
  @ApiOperation({ summary: "Get projects linked to an SDG" })
  @ApiParam({ name: "sdg", description: "SDG ID" })
  getProjectsBySdg(@Param("sdg", UuidValidationPipe) sdg: string) {
    return this.sdgService.getProjectsBySdg(sdg);
  }

  @Get("/sdgs/statistics")
  @ApiOperation({ summary: "Get SDG statistics" })
  getSdgStatistics() {
    return this.sdgService.getSdgStatistics();
  }

  @Get("/sdgs/coverage")
  @ApiOperation({ summary: "Get SDG coverage" })
  getSdgCoverage() {
    return this.sdgService.getSdgCoverage();
  }
}
