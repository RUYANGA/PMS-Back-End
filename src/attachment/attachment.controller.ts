import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import { UuidValidationPipe } from "../shared/pipes/uuid-validation.pipe";
import { AttachmentService } from "./attachment.service";
import { CreateAttachmentDto } from "./dto/create-attachment.dto";
import { QueryAttachmentDto } from "./dto/query-attachment.dto";
import { UpdateAttachmentDto } from "./dto/update-attachment.dto";

@ApiTags("Attachments")
@Controller("attachments")
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  @Post()
  @ApiOperation({ summary: "Create a new attachment" })
  @ApiResponse({ status: 201, description: "Attachment created successfully." })
  create(@Body() createAttachmentDto: CreateAttachmentDto) {
    return this.attachmentService.create(createAttachmentDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all attachments" })
  @ApiResponse({ status: 200, description: "List of attachments." })
  findAll(@Query() query: QueryAttachmentDto) {
    return this.attachmentService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get an attachment by ID" })
  @ApiParam({ name: "id", description: "ID of the attachment" })
  @ApiResponse({ status: 200, description: "Attachment details." })
  findOne(@Param("id", UuidValidationPipe) id: string) {
    return this.attachmentService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update an attachment" })
  @ApiParam({ name: "id", description: "ID of the attachment" })
  @ApiResponse({ status: 200, description: "Attachment updated." })
  update(
    @Param("id", UuidValidationPipe) id: string,
    @Body() updateAttachmentDto: UpdateAttachmentDto
  ) {
    return this.attachmentService.update(id, updateAttachmentDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete an attachment" })
  @ApiParam({ name: "id", description: "ID of the attachment" })
  @ApiResponse({ status: 200, description: "Attachment deleted." })
  remove(@Param("id", UuidValidationPipe) id: string) {
    return this.attachmentService.remove(id);
  }

  @Get(":id/download")
  @ApiOperation({ summary: "Get download URL" })
  @ApiParam({ name: "id", description: "ID of the attachment" })
  @ApiResponse({ status: 200, description: "Download URL." })
  download(@Param("id", UuidValidationPipe) id: string) {
    return this.attachmentService.download(id);
  }

  @Get(":id/metadata")
  @ApiOperation({ summary: "Get attachment metadata" })
  @ApiParam({ name: "id", description: "ID of the attachment" })
  @ApiResponse({ status: 200, description: "Attachment metadata." })
  metadata(@Param("id", UuidValidationPipe) id: string) {
    return this.attachmentService.metadata(id);
  }

  @Get("by-project/:projectId")
  @ApiOperation({ summary: "Get attachments by project" })
  @ApiParam({ name: "projectId", description: "Project ID" })
  @ApiResponse({ status: 200, description: "List of attachments." })
  findByProject(@Param("projectId", UuidValidationPipe) projectId: string) {
    return this.attachmentService.findByProject(projectId);
  }

  @Get("by-uploader/:userId")
  @ApiOperation({ summary: "Get attachments by uploader" })
  @ApiParam({ name: "userId", description: "Uploader ID" })
  @ApiResponse({ status: 200, description: "List of attachments." })
  findByUploader(@Param("userId", UuidValidationPipe) userId: string) {
    return this.attachmentService.findByUploader(userId);
  }
}
