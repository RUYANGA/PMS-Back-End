import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { InfrastructureService } from "../infrastructure/infrastructure.service";
import { LoggerService } from "../logger/logger.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoryService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly infrastructure: InfrastructureService
  ) {}

  async getAllCategories() {
    this.logger.log("Retrieving all categories", "CategoryService");
    const categories = await this.prisma.category.findMany();
    this.logger.log(`Found ${categories.length} categories`, "CategoryService");
    return {
      status: true,
      message: "Categories retrieved successfully",
      data: categories,
      meta: {},
    };
  }

  async getCategoryById(id: string) {
    this.logger.log(`Retrieving category with ID: ${id}`, "CategoryService");
    const category = await this.infrastructure.checkRecordExists("category", id);
    this.logger.log(`Successfully retrieved category with ID: ${id}`, "CategoryService");
    return {
      status: true,
      message: "Category retrieved successfully",
      data: category,
      meta: {},
    };
  }

  async createCategory(data: CreateCategoryDto) {
    this.logger.log(`Creating category: ${JSON.stringify(data)}`, "CategoryService");
    if (data.parentId) {
      await this.infrastructure.checkRecordExists("category", data.parentId);
    }
    await this.infrastructure.checkDuplicate("category", [
      { property: "name", value: data.name },
      { property: "parentId", value: data.parentId || null },
    ]);

    const category = await this.prisma.category.create({ data });
    this.logger.log(`Successfully created category with ID: ${category.id}`, "CategoryService");
    return {
      status: true,
      message: "Category created successfully",
      data: category,
      meta: {},
    };
  }

  async updateCategory(id: string, data: UpdateCategoryDto) {
    this.logger.log(
      `Updating category ${id} with data: ${JSON.stringify(data)}`,
      "CategoryService"
    );
    await this.infrastructure.checkRecordExists("category", id);

    if (data.parentId) {
      await this.infrastructure.checkRecordExists("category", data.parentId);
    }

    if (data.name || data.parentId !== undefined) {
      const existingCategory = await this.prisma.category.findUnique({ where: { id } });
      const newName = data.name !== undefined ? data.name : existingCategory.name;
      const newParentId = data.parentId !== undefined ? data.parentId : existingCategory.parentId;

      const duplicateCheckWhere: any = { name: newName };
      if (newParentId === null) {
        duplicateCheckWhere.parentId = null;
      } else {
        duplicateCheckWhere.parentId = newParentId;
      }

      const duplicate = await this.prisma.category.findFirst({
        where: { ...duplicateCheckWhere, id: { not: id } },
      });

      if (duplicate) {
        throw new BadRequestException(
          "Category with this name already exists under the specified parent."
        );
      }
    }

    const updatedCategory = await this.prisma.category.update({ where: { id }, data });
    this.logger.log(`Successfully updated category with ID: ${id}`, "CategoryService");
    return {
      status: true,
      message: "Category updated successfully",
      data: updatedCategory,
      meta: {},
    };
  }

  async deleteCategory(id: string) {
    this.logger.log(`Attempting to delete category: ${id}`, "CategoryService");
    await this.infrastructure.checkRecordExists("category", id);

    const hasChildren = await this.prisma.category.count({
      where: { parentId: id },
    });

    if (hasChildren > 0) {
      this.logger.warn(
        `Cannot delete category ${id} as it has ${hasChildren} child units`,
        "CategoryService"
      );
      throw new BadRequestException(
        `Category with ID ${id} cannot be deleted because it has ${hasChildren} child categories.`
      );
    }

    await this.prisma.category.delete({ where: { id } });
    this.logger.log(`Successfully deleted category: ${id}`, "CategoryService");
    return {
      status: true,
      message: "Category deleted successfully",
      data: null,
      meta: {},
    };
  }

  async getChildren(id: string) {
    this.logger.log(`Finding children of category: ${id}`, "CategoryService");
    await this.infrastructure.checkRecordExists("category", id);

    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { children: true },
    });
    this.logger.log(
      `Found ${category.children.length} children for category ${id}`,
      "CategoryService"
    );
    return {
      status: true,
      message: "Children retrieved successfully",
      data: category.children,
      meta: {},
    };
  }

  async getParent(id: string) {
    this.logger.log(`Finding parent of category: ${id}`, "CategoryService");
    const category = await this.infrastructure.checkRecordExists("category", id);

    if (category.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: category.parentId },
      });
      this.logger.log(
        `Found parent for category ${id}: ${parent?.id || "not found"}`,
        "CategoryService"
      );
      return {
        status: true,
        message: "Parent retrieved successfully",
        data: parent,
        meta: {},
      };
    }

    this.logger.log(`Category ${id} has no parent`, "CategoryService");
    return {
      status: true,
      message: "Category has no parent",
      data: null,
      meta: {},
    };
  }

  async getCategoryTree() {
    this.logger.log("Generating category tree structure", "CategoryService");
    const allCategories = await this.prisma.category.findMany({
      include: { children: true },
    });

    const categoryMap = new Map<string, any>();
    allCategories.forEach((cat) => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    const rootCategories: any[] = [];

    categoryMap.forEach((cat) => {
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId);
        if (parent) {
          parent.children.push(cat);
        } else {
          this.logger.warn(
            `Category ${cat.id} references non-existent parent ${cat.parentId}`,
            "CategoryService"
          );
        }
      } else {
        rootCategories.push(cat);
      }
    });

    this.logger.log(
      `Tree structure built with ${rootCategories.length} root categories`,
      "CategoryService"
    );
    return {
      status: true,
      message: "Category tree retrieved successfully",
      data: rootCategories,
      meta: {},
    };
  }

  async createChildCategory(parentId: string, data: CreateCategoryDto) {
    this.logger.log(`Adding child category to parent ${parentId}`, "CategoryService");
    await this.infrastructure.checkRecordExists("category", parentId);

    await this.infrastructure.checkDuplicate("category", [
      { property: "name", value: data.name },
      { property: "parentId", value: parentId },
    ]);

    const childCategory = await this.prisma.category.create({
      data: {
        ...data,
        parentId,
      },
    });

    this.logger.log(
      `Successfully added child ${childCategory.id} to parent ${parentId}`,
      "CategoryService"
    );
    return {
      status: true,
      message: "Child category created successfully",
      data: childCategory,
      meta: {},
    };
  }
}
