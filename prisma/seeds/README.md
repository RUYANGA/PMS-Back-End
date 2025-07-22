# Database Seeds

This directory contains seed files for populating the Kangalos database with initial data.

## Available Seeds

### 1. Organizations Seed (`organisations.ts`)

Seeds the complete University of Rwanda organizational structure:

- **University of Rwanda** (Root)
- **6 Colleges** (CASS, CAVM, CBE, CE, CMHS, CST)
- **25 Schools** across all colleges

**Total**: 32 organizational units created

### 2. Positions Seed (`positions.ts`)

Creates sample positions across different organizational units:

- Various position types: Leadership, Faculty, Research, Technical, Support, Administrative
- Randomly assigns 2-4 positions per school (first 10 schools)

## Usage

### Run All Seeds

```bash
npm run prisma:seed
```

### Run Individual Seeds

You can modify the main `seed.ts` file to run specific seeds by commenting/uncommenting the relevant lines.

### Reset Database Before Seeding

```bash
npm run prisma:migrate:reset
npm run prisma:seed
```

## Seed Structure

```
prisma/
├── seed.ts              # Main seed file
├── seeds/
│   ├── organisations.ts # University structure
│   ├── positions.ts     # Sample positions
│   └── README.md       # This file
```

## Development

### Adding New Seeds

1. Create a new seed file in the `seeds/` directory
2. Export seed and cleanup functions
3. Import and call the seed function in `prisma/seed.ts`

Example:

```typescript
// seeds/users.ts
export async function seedUsers() {
  // Your seed logic here
}

export async function cleanupUsers() {
  // Your cleanup logic here
}
```

```typescript
// seed.ts
import { seedUsers } from "./seeds/users";

async function main() {
  await seedOrganisations();
  await seedPositions();
  await seedUsers(); // Add new seed here
}
```

### Cleanup Functions

Each seed file includes a cleanup function to remove seeded data. This is useful for:

- Resetting data during development
- Preparing for fresh seeds
- Testing scenarios

## Data Structure

### University of Rwanda Organization Structure

```
University of Rwanda (UR)
├── College of Arts and Social Sciences (CASS)
│   ├── School of Arts and Languages and Communication Studies
│   ├── School of Social Studies and Governance
│   └── School of Law
├── College of Agriculture, Animal Sciences and Veterinary Medicine (CAVM)
│   ├── School of Medicine and Animal Sciences
│   ├── School of Agriculture and Food Sciences
│   ├── School of Agricultural Engineering
│   └── School of Forestry, Ecotourism, and Greenspace Management
├── College of Business and Economics (CBE)
│   ├── School of Business
│   └── School of Economics
├── College of Education (CE)
│   ├── School of Mathematics and Science Education
│   ├── School of Languages and Social Studies Education
│   └── School of Educational Sciences
├── College of Medicine and Health Sciences (CMHS)
│   ├── School of Medicine & Pharmacy
│   ├── School of Dentistry
│   ├── School of Nursing and Midwifery
│   ├── School of Health Sciences
│   └── School of Public Health
└── College of Science and Technology (CST)
    ├── School of Engineering
    ├── School of Science
    ├── School of Information Communication Technology
    ├── School of Architecture and Built Environment
    └── School of Mining and Geology
```

## Notes

- Seeds are designed to be idempotent where possible
- Always run `prisma:generate` after schema changes before seeding
- Seeds use the Prisma client configured in your project
- Error handling is included to provide clear feedback during seeding
