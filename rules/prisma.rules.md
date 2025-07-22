# Prisma Schema

## Schema Rules and Characteristics

### 1. **Naming Conventions**

- **Models**: Use PascalCase (e.g., `OrganisationUnit`, `UserPosition`)
- **Fields**: Use camelCase (e.g., `firstName`, `organisationUnitId`)
- **Database mapping**: Use snake_case with `@map()` (e.g., `@map("first_name")`)
- **Table mapping**: Use snake_case with `@@map()` (e.g., `@@map("organisation_unit")`)

### 2. **ID Standards**

- All primary keys use UUID format: `@id @default(uuid()) @db.Uuid`
- Foreign keys also use UUID: `@db.Uuid`
- Consistent `id` field naming across all models

### 3. **Timestamp Management**

- Every model has `createdAt` and `updatedAt` fields
- `createdAt`: `@default(now()) @map("created_at")`
- `updatedAt`: `@updatedAt @map("updated_at")`

### 4. **Foreign Key Conventions**

- Foreign keys follow pattern: `{modelName}Id` (e.g., `organisationUnitId`, `userId`)
- Always include `@map()` for database column names
- Use descriptive names that clearly indicate the relationship

### 5. **Relationship Definitions**

- Always define both sides of relationships
- Use `onDelete: Cascade` for dependent relationships
- Include proper indexing with `@@index()` for foreign keys

### 6. **Junction Table Rules**

- Use composite primary keys: `@@id([field1, field2])`
- Include creation timestamps
- Add individual indexes for each foreign key
- Name tables descriptively (e.g., `UserPosition`, `RolePermission`)

### 7. **Unique Constraints**

- Single field unique: `@unique` (e.g., `email`, `username`)
- Multi-field unique: `@@unique([field1, field2])` (e.g., role name within org unit)

### 8. **Optional vs Required Fields**

- Use `?` for optional fields consistently
- Required fields have no suffix
- Optional foreign keys use `?` (e.g., `parentId String?`)

### 9. **Enum Usage**

- Define enums at schema top level
- Use UPPERCASE values (e.g., `STUDENT`, `STAFF`)

### 10. **Documentation**

- Use `///` for model documentation
- Group related models with comment separators
- Organize schema with clear sections
