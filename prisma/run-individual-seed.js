#!/usr/bin/env node

/**
 * Individual seed runner
 * Usage: node run-individual-seed.js [seed-name]
 * Example: node run-individual-seed.js organisations
 */

const { PrismaClient } = require("../src/generated/prisma");
const prisma = new PrismaClient();

async function runIndividualSeed(seedName) {
  console.log(`🌱 Running individual seed: ${seedName}`);

  try {
    switch (seedName) {
      case "organisations":
        const { seedOrganisations } = require("./seeds/organisations");
        await seedOrganisations();
        break;

      case "positions":
        const { seedPositions } = require("./seeds/positions");
        await seedPositions();
        break;

      default:
        console.log("❌ Unknown seed name. Available seeds:");
        console.log("  - organisations");
        console.log("  - positions");
        process.exit(1);
    }

    console.log("✅ Individual seed completed successfully!");
  } catch (error) {
    console.error("❌ Error running individual seed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get seed name from command line arguments
const seedName = process.argv[2];

if (!seedName) {
  console.log("Usage: node run-individual-seed.js [seed-name]");
  console.log("Available seeds: organisations, positions");
  process.exit(1);
}

runIndividualSeed(seedName);
