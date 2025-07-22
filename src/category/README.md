# Category Module Explanation

This document explains the structure and logic of the `src/category` folder in the project. The Category module is responsible for managing categories, including CRUD operations and hierarchical relationships (parent/child categories).

## Files Overview

- **category.controller.ts**: Handles HTTP requests related to categories and maps them to service methods.
- **category.service.ts**: Contains the business logic for category operations and interacts with the database via Prisma.
- **category.module.ts**: Sets up the module, wiring together the controller, service, and Prisma provider.
- **dto/**: Contains Data Transfer Objects (DTOs) for validating and typing incoming data for category creation and updates.

---

## category.controller.ts

- Decorated with `@Controller('categories')`, it exposes RESTful endpoints for category operations.
- **Endpoints:**
  - `GET /categories`: Get all categories.
  - `GET /categories/tree`: Get the full category tree (hierarchical structure).
  - `GET /categories/:id`: Get a category by its ID.
  - `POST /categories`: Create a new category.
  - `PUT /categories/:id`: Update an existing category.
  - `DELETE /categories/:id`: Delete a category.
  - `GET /categories/:id/children`: Get all children of a category.
  - `GET /categories/:id/parent`: Get the parent of a category.
  - `POST /categories/:id/children`: Create a child category under a parent.
- Uses DTOs for input validation and pipes (like `ParseUUIDPipe`) for parameter validation.
- Handles not found errors with `NotFoundException`.

## category.service.ts

- Decorated with `@Injectable()`, it contains the core business logic for categories.
- Uses `PrismaService` to interact with the database.
- **Key Methods:**
  - `getAllCategories()`: Returns all categories.
  - `getCategoryById(id)`: Returns a category by ID.
  - `createCategory(data)`: Creates a new category, optionally as a child if `parentId` is provided.
  - `updateCategory(id, data)`: Updates a category, including changing its parent.
  - `deleteCategory(id)`: Deletes a category by ID.
  - `getChildren(id)`: Gets all children of a category.
  - `getParent(id)`: Gets the parent of a category.
  - `getCategoryTree()`: Builds and returns the full category tree (nested structure).
  - `createChildCategory(parentId, data)`: Creates a new child category under a given parent.
- Handles not found errors and validates parent existence before creating/updating child categories.

## category.module.ts

- Decorated with `@Module`, it registers the controller, service, and Prisma provider for dependency injection.
- Ensures all category-related logic is encapsulated and can be imported into the main app module.

## dto/

### create-category.dto.ts
- Defines the shape and validation rules for creating a category.
- Fields:
  - `name` (string, required): The name of the category.
  - `description` (string, optional): Description of the category.
  - `parentId` (string, optional): ID of the parent category (for hierarchical categories).

### update-category.dto.ts
- Defines the shape and validation rules for updating a category.
- All fields are optional, allowing partial updates:
  - `name` (string, optional)
  - `description` (string, optional)
  - `parentId` (string, optional)

---

## How It Works Together

- The **controller** receives HTTP requests and delegates to the **service**.
- The **service** performs business logic and interacts with the database using Prisma.
- **DTOs** ensure that incoming data is validated and correctly typed.
- The **module** ties everything together, making the category feature modular and maintainable.

This structure follows NestJS best practices for modular, scalable backend development. 