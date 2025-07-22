import { PrismaClient } from "../src/generated/prisma";
import { seedOrganisations } from "./seeds/organisations";
import { seedPositions } from "./seeds/positions";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  try {
    // Seed organizational structure
    await seedOrganisations();

    // Seed sample positions
    await seedPositions();

    // Add other seeds here as they are created
    // await seedUsers();
    // await seedFunders();

    console.log("✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error during database seeding:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error("❌ Unexpected error during seeding:", e);
  process.exit(1);
});
