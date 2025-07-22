import { Injectable } from "@nestjs/common";

import { InfrastructureService } from "../infrastructure/infrastructure.service";
import { LoggerService } from "../logger/logger.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAttachmentDto } from "./dto/create-attachment.dto";
import { QueryAttachmentDto } from "./dto/query-attachment.dto";
import { UpdateAttachmentDto } from "./dto/update-attachment.dto";

@Injectable()
export class AttachmentService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly infrastructure: InfrastructureService
  ) {}

  async create(createAttachmentDto: CreateAttachmentDto) {
    this.logger.log(
      `Creating attachment: ${JSON.stringify(createAttachmentDto)}`,
      "AttachmentService"
    );

    if (createAttachmentDto.projectId) {
      await this.infrastructure.checkRecordExists("project", createAttachmentDto.projectId);
    }
    await this.infrastructure.checkRecordExists("user", createAttachmentDto.uploaderId);

    const result = await this.prisma.attachment.create({
      data: {
        ...createAttachmentDto,
      },
    });

    return {
      status: true,
      message: "Attachment created successfully",
      data: result,
      meta: {},
    };
  }

  async findAll(query: QueryAttachmentDto) {
    const { page = 1, limit = 10, search, projectId, uploaderId } = query;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (search) {
      where.filename = { contains: search, mode: "insensitive" as const };
    }
    if (projectId) {
      where.projectId = projectId;
    }
    if (uploaderId) {
      where.uploaderId = uploaderId;
    }

    const [attachments, total] = await this.prisma.$transaction([
      this.prisma.attachment.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
      this.prisma.attachment.count({ where }),
    ]);

    return {
      status: true,
      message: "Successfully retrieved items",
      data: attachments,
      meta: this.infrastructure.generatePaginationMeta(total, page, limit, "/attachments"),
    };
  }

  async findOne(id: string) {
    const attachment = await this.infrastructure.checkRecordExists("attachment", id);
    return {
      status: true,
      message: "Attachment retrieved successfully",
      data: attachment,
      meta: {},
    };
  }

  async update(id: string, updateAttachmentDto: UpdateAttachmentDto) {
    await this.infrastructure.checkRecordExists("attachment", id);

    if (updateAttachmentDto.projectId) {
      await this.infrastructure.checkRecordExists("project", updateAttachmentDto.projectId);
    }
    if (updateAttachmentDto.uploaderId) {
      await this.infrastructure.checkRecordExists("user", updateAttachmentDto.uploaderId);
    }

    const result = await this.prisma.attachment.update({
      where: { id },
      data: updateAttachmentDto,
    });

    return {
      status: true,
      message: "Attachment updated successfully",
      data: result,
      meta: {},
    };
  }

  async remove(id: string) {
    await this.infrastructure.checkRecordExists("attachment", id);
    await this.prisma.attachment.delete({ where: { id } });
    return {
      status: true,
      message: "Attachment deleted successfully",
      data: null,
      meta: {},
    };
  }

  async download(id: string) {
    const attachment = await this.infrastructure.checkRecordExists("attachment", id);
    return {
      status: true,
      message: "Download URL retrieved successfully",
      data: { url: attachment.url },
      meta: {},
    };
  }

  async metadata(id: string) {
    const attachment = await this.infrastructure.checkRecordExists("attachment", id);
    return {
      status: true,
      message: "Metadata retrieved successfully",
      data: {
        id: attachment.id,
        filename: attachment.filename,
        fileType: attachment.fileType,
        fileSize: attachment.fileSize,
        metadata: attachment.metadata,
        createdAt: attachment.createdAt,
        updatedAt: attachment.updatedAt,
      },
      meta: {},
    };
  }

  async findByProject(projectId: string) {
    await this.infrastructure.checkRecordExists("project", projectId);
    const attachments = await this.prisma.attachment.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });
    return {
      status: true,
      message: "Attachments retrieved successfully",
      data: attachments,
      meta: {},
    };
  }

  async findByUploader(uploaderId: string) {
    await this.infrastructure.checkRecordExists("user", uploaderId);
    const attachments = await this.prisma.attachment.findMany({
      where: { uploaderId },
      orderBy: { createdAt: "desc" },
    });
    return {
      status: true,
      message: "Attachments retrieved successfully",
      data: attachments,
      meta: {},
    };
  }
}
