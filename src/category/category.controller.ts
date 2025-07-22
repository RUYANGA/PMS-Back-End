import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import { UuidValidationPipe } from "../shared/pipes/uuid-validation.pipe";
import { CategoryService } from "./category.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@ApiTags("Categories")
@Controller("categories")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiOperation({ summary: "Get all categories" })
  @ApiResponse({ status: 200, description: "List of all categories." })
  @Get()
  async getAllCategories() {
    return this.categoryService.getAllCategories();
  }

  @ApiOperation({ summary: "Get the category tree" })
  @ApiResponse({ status: 200, description: "Category tree structure." })
  @Get("tree")
  async getCategoryTree() {
    return this.categoryService.getCategoryTree();
  }

  @ApiOperation({ summary: "Get a category by ID" })
  @ApiParam({ name: "id", type: "string", description: "Category UUID" })
  @ApiResponse({ status: 200, description: "Category found." })
  @ApiResponse({ status: 404, description: "Category not found." })
  @Get(":id")
  async getCategoryById(@Param("id", UuidValidationPipe) id: string) {
    return this.categoryService.getCategoryById(id);
  }

  @ApiOperation({ summary: "Create a new category" })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 201, description: "Category created." })
  @Post()
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.createCategory(createCategoryDto);
  }

  @ApiOperation({ summary: "Update a category by ID" })
  @ApiParam({ name: "id", type: "string", description: "Category UUID" })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({ status: 200, description: "Category updated." })
  @ApiResponse({ status: 404, description: "Category not found." })
  @Put(":id")
  async updateCategory(
    @Param("id", UuidValidationPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    return this.categoryService.updateCategory(id, updateCategoryDto);
  }

  @ApiOperation({ summary: "Delete a category by ID" })
  @ApiParam({ name: "id", type: "string", description: "Category UUID" })
  @ApiResponse({ status: 200, description: "Category deleted." })
  @ApiResponse({ status: 404, description: "Category not found." })
  @Delete(":id")
  async deleteCategory(@Param("id", UuidValidationPipe) id: string) {
    return this.categoryService.deleteCategory(id);
  }

  @ApiOperation({ summary: "Get children of a category" })
  @ApiParam({ name: "id", type: "string", description: "Category UUID" })
  @ApiResponse({ status: 200, description: "List of child categories." })
  @ApiResponse({ status: 404, description: "Category not found." })
  @Get(":id/children")
  async getChildren(@Param("id", UuidValidationPipe) id: string) {
    return this.categoryService.getChildren(id);
  }

  @ApiOperation({ summary: "Get parent of a category" })
  @ApiParam({ name: "id", type: "string", description: "Category UUID" })
  @ApiResponse({ status: 200, description: "Parent category." })
  @ApiResponse({ status: 404, description: "Category not found or has no parent." })
  @Get(":id/parent")
  async getParent(@Param("id", UuidValidationPipe) id: string) {
    return this.categoryService.getParent(id);
  }

  @ApiOperation({ summary: "Create a child category under a parent" })
  @ApiParam({ name: "id", type: "string", description: "Parent category UUID" })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 201, description: "Child category created." })
  @ApiResponse({ status: 404, description: "Parent category not found." })
  @Post(":id/children")
  async createChildCategory(
    @Param("id", UuidValidationPipe) parentId: string,
    @Body() createCategoryDto: CreateCategoryDto
  ) {
    return this.categoryService.createChildCategory(parentId, createCategoryDto);
  }
}
